'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const identifier = (formData.get('identifier') as string) || '';
  const password = (formData.get('password') as string) || '';
  const from = (formData.get('from') as string) || '';

  const validId = process.env.ACCESS_LOGIN;
  const validPw = process.env.ACCESS_PASSWORD;

  if (!identifier || !password || identifier !== validId || password !== validPw) {
    const params = new URLSearchParams({ error: '1' });
    if (from) params.set('from', from);
    redirect(`/login?${params.toString()}`);
  }

  const safeFrom =
    from && from.startsWith('/') && !from.startsWith('/login') ? from : '/inscription';

  cookies().set('rnp_access', 'ok', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  });

  redirect(safeFrom);
}
