import { createClient } from 'npm:@supabase/supabase-js@2';
import { ApplicationServer, PushMessageError, Urgency } from 'jsr:@negrel/webpush@0.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const REMINDER_MINUTES = [60, 30, 10, 5, 1];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function base64UrlToBytes(base64Url: string) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function importVapidKeys(publicKey: string, privateKey: string): Promise<CryptoKeyPair> {
  const publicBytes = base64UrlToBytes(publicKey);

  if (publicBytes.length !== 65 || publicBytes[0] !== 0x04) {
    throw new Error('VAPID_PUBLIC_KEY inválida. A chave pública precisa estar no formato base64url não comprimido.');
  }

  const x = publicBytes.slice(1, 33);
  const y = publicBytes.slice(33, 65);

  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: bytesToBase64Url(x),
    y: bytesToBase64Url(y),
    d: privateKey,
    ext: true,
    key_ops: ['sign', 'verify'],
  };

  const privateCryptoKey = await crypto.subtle.importKey(
    'jwk',
    { ...jwk, key_ops: ['sign'] },
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign'],
  );

  const publicCryptoKey = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, ext: true, key_ops: ['verify'] },
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['verify'],
  );

  return {
    privateKey: privateCryptoKey,
    publicKey: publicCryptoKey,
  };
}

async function createApplicationServer(vapidKeys: CryptoKeyPair) {
  const encryptionKeys = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveBits'],
  );

  return await ApplicationServer.new({
    contactInformation: Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@retrancaunited.app',
    vapidKeys,
    keys: encryptionKeys,
  });
}

function getLocalDateString(date: Date, timezoneOffset: string) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const sign = timezoneOffset.startsWith('-') ? -1 : 1;
  const [hours, minutes] = timezoneOffset.slice(1).split(':').map(Number);
  const offsetMs = sign * ((hours || 0) * 60 + (minutes || 0)) * 60000;
  const localDate = new Date(utc + offsetMs);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function eventDateTimeToDate(eventDate: string, eventTime: string | null, timezoneOffset: string) {
  const safeTime = eventTime ? String(eventTime).slice(0, 5) : '00:00';
  return new Date(`${eventDate}T${safeTime}:00${timezoneOffset}`);
}

function buildNotificationMessage(event: any, reminderMinutes: number) {
  const title = event.title || 'Evento da agenda';
  const type = event.event_type || 'outro';

  if (reminderMinutes === 1) {
    if (type === 'jogo') {
      return {
        title: '⚽ Retranca United',
        body: `O jogo vai começar agora: ${title}`,
      };
    }

    if (type === 'treino') {
      return {
        title: '🏃 Retranca United',
        body: `O treino vai começar agora: ${title}`,
      };
    }

    if (type === 'reuniao') {
      return {
        title: '📋 Retranca United',
        body: `A reunião vai começar agora: ${title}`,
      };
    }

    return {
      title: 'Retranca United',
      body: `Vai começar agora: ${title}`,
    };
  }

  const label = reminderMinutes === 60 ? '1 hora' : `${reminderMinutes} minutos`;

  if (type === 'jogo') {
    return {
      title: '⚽ Retranca United',
      body: `Falta ${label} para o jogo: ${title}`,
    };
  }

  if (type === 'treino') {
    return {
      title: '🏃 Retranca United',
      body: `Falta ${label} para o treino: ${title}`,
    };
  }

  if (type === 'reuniao') {
    return {
      title: '📋 Retranca United',
      body: `Falta ${label} para a reunião: ${title}`,
    };
  }

  return {
    title: 'Retranca United',
    body: `Falta ${label} para: ${title}`,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Use POST.' }, 405);
  }

  const expectedSecret = Deno.env.get('CRON_SECRET');
  const receivedSecret = req.headers.get('x-cron-secret');

  if (expectedSecret && receivedSecret !== expectedSecret) {
    return jsonResponse({ error: 'Unauthorized.' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const timezoneOffset = Deno.env.get('EVENT_TIMEZONE_OFFSET') || '-04:00';

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return jsonResponse({ error: 'Secrets obrigatórios ausentes.' }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date();
  const today = getLocalDateString(now, timezoneOffset);

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'marcado')
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true });

  if (eventsError) {
    return jsonResponse({ error: eventsError.message }, 500);
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('notification_subscriptions')
    .select('*')
    .eq('active', true);

  if (subscriptionsError) {
    return jsonResponse({ error: subscriptionsError.message }, 500);
  }

  if (!subscriptions?.length || !events?.length) {
    return jsonResponse({ sent: 0, reason: 'Sem eventos ou dispositivos cadastrados.' });
  }

  const vapidKeys = await importVapidKeys(vapidPublicKey, vapidPrivateKey);
  const appServer = await createApplicationServer(vapidKeys);
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const event of events) {
    if (!event.event_date || !event.event_time) {
      skipped += 1;
      continue;
    }

    const eventDate = eventDateTimeToDate(event.event_date, event.event_time, timezoneOffset);
    const diffMs = eventDate.getTime() - now.getTime();

    for (const reminderMinutes of REMINDER_MINUTES) {
      const targetMs = reminderMinutes * 60 * 1000;
      const isInsideWindow = diffMs >= targetMs - 59_999 && diffMs <= targetMs + 59_999;

      if (!isInsideWindow) {
        continue;
      }

      const message = buildNotificationMessage(event, reminderMinutes);

      for (const row of subscriptions) {
        const endpoint = row.endpoint;

        const { data: existingLog, error: logLookupError } = await supabase
          .from('agenda_notification_logs')
          .select('id')
          .eq('event_id', event.id)
          .eq('reminder_minutes', reminderMinutes)
          .eq('subscription_endpoint', endpoint)
          .maybeSingle();

        if (logLookupError) {
          failed += 1;
          console.error('Erro ao consultar log:', logLookupError.message);
          continue;
        }

        if (existingLog) {
          skipped += 1;
          continue;
        }

        try {
          const subscriber = appServer.subscribe(row.subscription as PushSubscription);

          await subscriber.pushTextMessage(
            JSON.stringify({
              title: message.title,
              body: message.body,
              url: '/',
            }),
            {
              ttl: 60 * 60,
              urgency: Urgency.High,
            },
          );

          const { error: insertLogError } = await supabase
            .from('agenda_notification_logs')
            .insert({
              event_id: event.id,
              reminder_minutes: reminderMinutes,
              subscription_endpoint: endpoint,
            });

          if (insertLogError) {
            console.error('Erro ao gravar log:', insertLogError.message);
          }

          sent += 1;
        } catch (error) {
          failed += 1;
          console.error('Erro ao enviar push:', error);

          if (error instanceof PushMessageError && error.isGone()) {
            await supabase
              .from('notification_subscriptions')
              .update({ active: false })
              .eq('endpoint', endpoint);
          }
        }
      }
    }
  }

  return jsonResponse({ sent, skipped, failed, checkedEvents: events.length, checkedSubscriptions: subscriptions.length });
});
