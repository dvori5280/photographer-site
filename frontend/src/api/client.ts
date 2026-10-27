const API_URL = import.meta.env.VITE_API_URL;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  

  const response = await fetch(API_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token? {Authorization:"Bearer " + token} : {})
    },
  });

  if(response.status === 204 )
    return undefined as T;
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error.message);
  }

  return json.data;
}