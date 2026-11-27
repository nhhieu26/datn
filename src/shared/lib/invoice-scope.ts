/**
 * Phạm vi xem hóa đơn: khách hàng chỉ xem đơn của mình, nhà cung cấp chỉ xem đơn
 * của hồ sơ mình, admin xem toàn sàn.
 */
export type InvoiceScope =
  | { customerId: string }
  | { providerProfileId: string }
  | { all: true };

export function invoiceScopeWhere(scope: InvoiceScope) {
  if ("customerId" in scope) return { customerId: scope.customerId };
  if ("providerProfileId" in scope) {
    return { providerProfileId: scope.providerProfileId };
  }
  return {};
}
