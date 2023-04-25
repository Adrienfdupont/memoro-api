export default function generateToken(name: String) {
  const date = new Date(Date.now());
  const payload: Object = {
    name: name,
    date: date.toISOString(),
  };
  console.log(payload);
}