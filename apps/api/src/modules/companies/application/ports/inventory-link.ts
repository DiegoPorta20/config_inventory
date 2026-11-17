export interface ProvisionedAdmin {
  id: number;
  email: string;
  name: string;
}

/** The only thing this back office asks of the inventory app itself. */
export abstract class InventoryLink {
  abstract createAdmin(
    companyId: number,
    input: { email: string; name: string; password: string },
  ): Promise<ProvisionedAdmin>;
}
