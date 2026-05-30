const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export { API_BASE_URL };

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Request failed. Please try again.");
  }

  return response.json();
}

export function getTickets({ search = "", status = "All", signal } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (status !== "All") params.set("status", status);
  const query = params.toString();
  return request(`/api/tickets${query ? `?${query}` : ""}`, { signal });
}

export function healthCheck() {
  return request("/health");
}

export function getAnalytics() {
  return request("/api/analytics");
}

export function getCustomers() {
  return request("/api/customers");
}

export function getCustomer(email) {
  return request(`/api/customers/${encodeURIComponent(email)}`);
}

export function createTicket(payload) {
  return request("/api/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getTicket(ticketId) {
  return request(`/api/tickets/${ticketId}`);
}

export function updateTicket(ticketId, payload) {
  return request(`/api/tickets/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
