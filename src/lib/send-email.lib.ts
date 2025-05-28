import { Resend } from 'resend';

const resend = new Resend('re_LRTcmBJ9_ETi8SCHiZcSBXw4N45fXv6qi');

export async function sendEmail(resetUrl: string, email: string) {
  return await resend.emails.send({
    from: 'FreeQ <notificaciones@freeq.cl>',
    to: [email],
    subject: 'Amo a la Caro! <3',
    html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para resetear tu clave</p>`,
  });
}
