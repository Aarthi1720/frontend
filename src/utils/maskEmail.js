export function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  const first = local[0];
  const last = local[local.length - 1];
  const masked = local.length <= 2 ? '*' : `${first}***${last}`;
  return `${masked}@${domain}`;
}
