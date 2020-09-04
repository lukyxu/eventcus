export default async function AllocateTickets(data) {
  const res = await fetch('/allocate', {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include"
  });
  if (res.status === 401) {
    console.log(`ERROR: ${res.status}`);
    return null;
  }
  const data_1 = await res.json();
  return data_1;
}