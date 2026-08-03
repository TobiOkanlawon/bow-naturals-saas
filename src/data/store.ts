// Centralized data store - uses pluggable storage adapter and CRUD repositories
import { supabase } from "@/config/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

// ==========================================
// DATA TRANSFORMERS
// ==========================================

export interface CreateStaffRequest {
  companyId: string;

  fullName: string;
  email: string;
  password: string;

  role: UserRole;
  status: "active";

  department?: string;
  phone?: string;
  salary?: number;
  joinDate?: string; // ISO date string (YYYY-MM-DD)

  permissions?: Permissions;
}

export const LogisticsInventoryMapper = {
  toDomain(row: Tables<"logistics_inventory">): LogisticsInventoryItem {
    return {
      productId: row.product_id,
      quantity: row.quantity,
      minStock: row.min_stock,
    };
  },

  toInsert(
    logisticsCompanyId: string,
    data: LogisticsInventoryItem,
  ): TablesInsert<"logistics_inventory"> {
    return {
      logistics_company_id: logisticsCompanyId,
      product_id: data.productId,
      quantity: data.quantity,
      min_stock: data.minStock,
    };
  },

  toUpdate(
    logisticsCompanyId: string,
    data: LogisticsInventoryItem,
  ): TablesUpdate<"logistics_inventory"> {
    return {
      logistics_company_id: logisticsCompanyId,
      quantity: data.quantity,
      min_stock: data.minStock,
      product_id: data.productId,
    };
  },
};

export const CompanyDataMapper = {
  toDomain({
    company,
    profile,
    subscriptionPlan: plan,
  }: {
    company: Tables<"company">;
    profile: Pick<Tables<"profile">, "full_name" | "email">;
    subscriptionPlan: Tables<"subscription_plan">;
  }): Company {
    return {
      id: company.id,
      name: company.name,
      planId: company.plan_id ? company.plan_id : undefined,
      planName: plan.name ?? "",
      logoUrl: "",
      logoEmoji: "",
      primaryColor: "",
      primaryDark: "",
      primaryLight: "",
      sidebarGradientFrom: "",
      sidebarGradientTo: "",
      accentColor: "",
      phoneNumber: "",
      accountNumber: "",
      bankName: "",
      accountName: "",
      thankYouMessage: "",
      ceoName: profile.full_name,
      ceoEmail: profile.email,
    };
  },

  toUpdate(data: Partial<Company>): TablesUpdate<"company"> {
    return {
      name: data.name,
      tagline: data.tagline,
      logo_url: data.logoUrl,
      logo_emoji: data.logoEmoji,
      primary_color: data.primaryColor,
      primary_dark: data.primaryDark,
      primary_light: data.primaryLight,
      sidebar_gradient_from: data.sidebarGradientFrom,
      sidebar_gradient_to: data.sidebarGradientTo,
      accent_color: data.accentColor,
      phone_number: data.phoneNumber,
      account_number: data.accountNumber,
      bank_name: data.bankName,
      account_name: data.accountName,
      thank_you_message: data.thankYouMessage,
      updated_at: new Date().toISOString(),
    };
  },
};

export const StaffMapper = {
  toDomain(row: Tables<"profile">): StaffMember {
    return {
      id: row.id,
      userId: row.user_id,
      companyId: row.company_id,
      fullName: row.full_name,
      role: row.role,
      createdAt: row.created_at,
    };
  },
  toInsert(
    data: Omit<StaffMember, "id" | "createdAt">,
    companyId: string,
  ): TablesInsert<"profile"> {
    return {
      company_id: companyId,
      full_name: data.fullName,
      role: data.role,
      user_id: data.userId,
    };
  },
  toUpdate(data: Partial<StaffMember>): TablesUpdate<"profile"> {
    return {
      full_name: data.fullName,
      role: data.role,
      user_id: data.userId,
      company_id: data.companyId ?? undefined,
    };
  },
};

export const ProductMapper = {
  toDomain(
    row: Tables<"product"> & {
      product_price_tier?: Tables<"product_price_tier">[];
    },
  ): Product {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      status: row.status,
      totalStock: row.total_stock,
      category: row.category,
      benefits: row.benefits,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      tiers:
        row.product_price_tier &&
        row.product_price_tier.map((d) => ProductPriceTierMapper.toDomain(d)),
    };
  },
  toInsert(
    data: Omit<Product, "id" | "companyId">,
    companyId: string,
  ): TablesInsert<"product"> {
    return {
      company_id: companyId,
      name: data.name,
      status: data.status,
      total_stock: data.totalStock,
      category: data.category,
      benefits: data.benefits,
      image_url: data.imageUrl,
    };
  },
  toUpdate(data: Partial<Product>): TablesUpdate<"product"> {
    return {
      name: data.name,
      status: data.status,
      total_stock: data.totalStock,
      category: data.category,
      benefits: data.benefits,
      image_url: data.imageUrl,
      updated_at: new Date().toISOString(),
    };
  },
};

export const ProductPriceTierMapper = {
  toDomain(row: Tables<"product_price_tier">): ProductTier {
    return {
      id: row.id,
      name: row.name,
      productId: row.product_id,
      costPrice: row.cost_price,
      sellingPrice: row.selling_price,
    };
  },
  toInsert(data: Omit<ProductTier, "id">): TablesInsert<"product_price_tier"> {
    return {
      name: data.name,
      product_id: data.productId,
      cost_price: data.costPrice,
      selling_price: data.sellingPrice,
    };
  },
  toUpdate(data: Partial<ProductTier>): TablesUpdate<"product_price_tier"> {
    return {
      name: data.name,
      product_id: data.productId,
      cost_price: data.costPrice,
      selling_price: data.sellingPrice,
    };
  },
};

export const LogisticsMapper = {
  toDomain(row: Tables<"logistics_company">): LogisticsCompany {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      phone: row.phone,
      location: row.location,
      createdAt: row.created_at,
    };
  },
  toInsert(
    data: Omit<LogisticsCompany, "id" | "companyId">,
    companyId: string,
  ): TablesInsert<"logistics_company"> {
    return {
      company_id: companyId,
      name: data.name,
      phone: data.phone,
      location: data.location,
    };
  },
  toUpdate(data: Partial<LogisticsCompany>): TablesUpdate<"logistics_company"> {
    return {
      name: data.name,
      phone: data.phone,
      location: data.location,
    };
  },
};

export const OrderMapper = {
  toDomain(row: any): Order {
    return {
      id: row.id,
      companyId: row.company_id,
      serialNumber: row.serial_number,

      customerName: row.customer_name,
      phoneNumber: row.phone_number,
      whatsappNumber: row.whatsapp_number,

      deliveryAddress: row.delivery_address,
      city: row.city,
      state: row.state,

      dealType: row.deal_type,

      orderDate: row.order_date,
      expectedDeliveryDate: row.expected_delivery_date,
      actualDeliveryDate: row.actual_delivery_date,

      followUpDate: row.follow_up_date,

      orderStatus: row.order_status,

      deliveryFee: row.delivery_fee,

      logisticsCompanyId: row.logistics_company_id,
      logisticsLocation: row.logistics_location,

      paymentStatus: row.payment_status,

      amountPaid: row.amount_paid,
      totalAmount: row.total_amount,
      totalCost: row.total_cost,
      grossProfit: row.gross_profit,

      notes: row.notes,

      createdBy: row.created_by,
      createdAt: row.created_at,

      isReturnCustomer: row.is_return_customer,
      previousOrderId: row.previous_order_id,

      followUpStatus: row.follow_up_status,
      followUpNotes: row.follow_up_notes,
      followUpContactedAt: row.follow_up_contacted_at,

      items: row.order_items?.map(ProductMapper.toDomain) ?? [],
    };
  },
  toInsert(
    data: Omit<Order, "id" | "companyId">,
    companyId: string,
  ): TablesInsert<"orders"> {
    return {
      company_id: companyId,
      customer_name: data.customerName,
      deal_type: data.dealType,
      order_status: data.orderStatus,
      serial_number: data.serialNumber,
      amount_paid: data.amountPaid,
      total_amount: data.totalAmount,
      total_cost: data.totalCost,
      gross_profit: data.grossProfit,
      delivery_fee: data.deliveryFee,
      city: data.city,
      state: data.state,
      delivery_address: data.deliveryAddress,
      phone_number: data.phoneNumber,
      whatsapp_number: data.whatsappNumber,
      notes: data.notes,
      order_date: data.orderDate,
      expected_delivery_date: !!data.expectedDeliveryDate
        ? data.expectedDeliveryDate
        : null,
      actual_delivery_date: data.actualDeliveryDate,
      logistics_company_id: data.logisticsCompanyId,
      logistics_location: data.logisticsLocation,
      created_by: data.createdBy,
    };
  },
  toUpdate(data: Partial<Order>): TablesUpdate<"orders"> {
    return {
      customer_name: data.customerName,
      deal_type: data.dealType,
      order_status: data.orderStatus,
      serial_number: data.serialNumber,
      amount_paid: data.amountPaid,
      total_amount: data.totalAmount,
      total_cost: data.totalCost,
      gross_profit: data.grossProfit,
      delivery_fee: data.deliveryFee,
      city: data.city,
      state: data.state,
      delivery_address: data.deliveryAddress,
      phone_number: data.phoneNumber,
      whatsapp_number: data.whatsappNumber,
      notes: data.notes,
      order_date: data.orderDate,
      expected_delivery_date: data.expectedDeliveryDate,
      actual_delivery_date: data.actualDeliveryDate,
      logistics_company_id: data.logisticsCompanyId,
      logistics_location: data.logisticsLocation,
    };
  },
};

export const TaskMapper = {
  toDomain(row: Tables<"task">): Task {
    return {
      id: row.id,
      companyId: row.company_id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      assignee: row.assignee,
      dueDate: row.due_date,
      createdAt: row.created_at,
    };
  },
  toInsert(
    data: Omit<Task, "id" | "companyId">,
    companyId: string,
  ): TablesInsert<"task"> {
    return {
      company_id: companyId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      due_date: data.dueDate,
    };
  },
  toUpdate(data: Partial<Task>): TablesUpdate<"task"> {
    return {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      due_date: data.dueDate,
    };
  },
};

export const MessageMapper = {
  toDomain(row: Tables<"chat_message">): ChatMessage {
    return {
      id: row.id,
      companyId: row.company_id,
      message: row.message,
      sender: row.sender,
      senderRole: row.sender_role,
      recipientId: row.recipient_id,
      recipientName: row.recipient_name,
      channel: row.channel,
      isDirectMessage: row.is_direct_message,
      createdAt: row.created_at,
    };
  },
  toInsert(
    data: Omit<ChatMessage, "id" | "companyId">,
    companyId: string,
  ): TablesInsert<"chat_message"> {
    return {
      company_id: companyId,
      message: data.message,
      sender: data.sender,
      sender_role: data.senderRole,
      recipient_id: data.recipientId,
      recipient_name: data.recipientName,
      channel: data.channel,
      is_direct_message: data.isDirectMessage,
    };
  },
  toUpdate(data: Partial<ChatMessage>): TablesUpdate<"chat_message"> {
    return {
      message: data.message,
      sender: data.sender,
      sender_role: data.senderRole,
      recipient_id: data.recipientId,
      recipient_name: data.recipientName,
      channel: data.channel,
      is_direct_message: data.isDirectMessage,
    };
  },
};

export const ExpenseMapper = {
  toDomain(row: Tables<"expense">): Expense {
    return {
      id: row.id,
      companyId: row.company_id,
      amount: row.amount,
      category: row.category,
      description: row.description,
      date: row.date,
      receipt: row.receipt,
      status: row.status,
      submittedBy: row.submitted_by,
      createdAt: row.created_at,
    };
  },
  toInsert(
    data: Omit<Expense, "id" | "companyId">,
    companyId: string,
  ): TablesInsert<"expense"> {
    return {
      company_id: companyId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      receipt: data.receipt,
      status: data.status,
      submitted_by: data.submittedBy,
    };
  },
  toUpdate(data: Partial<Expense>): TablesUpdate<"expense"> {
    return {
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: data.date,
      receipt: data.receipt,
      status: data.status,
      submitted_by: data.submittedBy,
    };
  },
};

/**
 * CompanyDataStore - CRUD-based multi-tenant data management
 * Uses repositories to isolate data by companyId
 */
export class CompanyDataStore {
  constructor(private readonly supabase: SupabaseClient) { }

  private async create<TDomain, TInsert>(
    table: keyof Database["public"]["Tables"],
    insertPayload: TInsert,
    toDomain: (row: any) => TDomain,
  ): Promise<TDomain> {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(insertPayload as any)
      .select()
      .single();

    if (error) throw error;
    return toDomain(result);
  }

  private async read<TDomain>(
    table: keyof Database["public"]["Tables"],
    companyId: string,
    id: string | number,
    toDomain: (row: any) => TDomain,
  ): Promise<TDomain | null> {
    const { data, error } = await this.supabase
      .from(table)
      .select("*")
      .eq("company_id", companyId)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return toDomain(data);
  }

  private async readAll<TDomain>(
    table: keyof Database["public"]["Tables"],
    companyId: string,
    toDomain: (row: any) => TDomain,
  ): Promise<TDomain[]> {
    const { data, error } = await this.supabase
      .from(table)
      .select("*")
      .eq("company_id", companyId);

    if (error || !data) return [];
    return data.map(toDomain);
  }

  private async update<TDomain, TUpdate>(
    table: keyof Database["public"]["Tables"],
    companyId: string,
    id: string | number,
    updatePayload: TUpdate,
    toDomain: (row: any) => TDomain,
  ): Promise<TDomain | null> {
    const { data, error } = await this.supabase
      .from(table)
      .update(updatePayload as any)
      .eq("company_id", companyId)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return toDomain(data);
  }

  private async delete(
    table: keyof Database["public"]["Tables"],
    companyId: string,
    id: string | number,
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq("company_id", companyId)
      .eq("id", id);

    return !error;
  }

  // ------------------------------------------------------------------
  // STAFF
  // ------------------------------------------------------------------
  async createStaff(
    companyId: string,
    data: CreateStaffRequest,
  ): Promise<StaffMember> {
    const { data: d, error: e } = await this.supabase.functions.invoke(
      "create-staff",
      {
        body: {
          ...data,
          companyId,
        },
      },
    );

    if (e) {
      throw new Error("failed to create staff");
    }

    return d;
  }

  async getStaff(companyId: string, id: string): Promise<StaffMember | null> {
    return this.read("profile", companyId, id, StaffMapper.toDomain);
  }

  async getAllStaff(companyId: string): Promise<StaffMember[]> {
    return this.readAll("profile", companyId, StaffMapper.toDomain);
  }

  async updateStaff(
    companyId: string,
    id: number,
    data: Partial<StaffMember>,
  ): Promise<StaffMember | null> {
    return this.update(
      "profile",
      companyId,
      id,
      StaffMapper.toUpdate(data),
      StaffMapper.toDomain,
    );
  }

  async deleteStaff(companyId: string, id: number): Promise<boolean> {
    return this.delete("profile", companyId, id);
  }

  /* Company Data */

  async getCompanyData(companyId: string): Promise<Company> {
    const { data, error } = await this.supabase
      .from("company")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();

    if (error || !data) throw error;

    const { data: planData, error: e } = await this.supabase
      .from("subscription_plan")
      .select("*")
      .eq("id", data.plan_id)
      .maybeSingle();

    if (e || !planData) {
      // plan may be optional — continue without throwing
      // console.debug("planData: ", planData, e);
    }

    const { data: ceoData, error: f } = await this.supabase
      .from("profile")
      .select("full_name, email")
      .eq("role", "ceo")
      .eq("company_id", companyId)
      .maybeSingle();

    if (f || !ceoData) throw f;

    return CompanyDataMapper.toDomain({
      company: data,
      subscriptionPlan: planData || {},
      profile: ceoData,
    });
  }

  /**
   * Update company-level settings and (if provided) the CEO profile row for this company.
   * Note: password changes are not handled here (requires auth/admin function).
   */
  async updateCompanyData(
    companyId: string,
    data: Partial<Company>,
  ): Promise<Company | null> {
    // 1) Update company row
    const { data: updatedCompany, error } = await this.supabase
      .from("company")
      .update(CompanyDataMapper.toUpdate(data))
      .eq("id", companyId)
      .select()
      .maybeSingle();

    if (error) throw error;

    // 2) Update CEO profile row if ceoName or ceoEmail provided
    let updatedCeo: any = null;
    if (data.ceoName !== undefined || data.ceoEmail !== undefined) {
      const updatePayload: any = {};
      if (data.ceoName !== undefined) updatePayload.full_name = data.ceoName;
      if (data.ceoEmail !== undefined) updatePayload.email = data.ceoEmail;

      const { data: ceoRow, error: ceoErr } = await this.supabase
        .from("profile")
        .update(updatePayload)
        .eq("company_id", companyId)
        .eq("role", "ceo")
        .select()
        .maybeSingle();

      if (ceoErr) throw ceoErr;
      updatedCeo = ceoRow;
    } else {
      // fetch existing ceo for domain mapping
      const { data: ceoRow, error: ceoErr } = await this.supabase
        .from("profile")
        .select("full_name, email")
        .eq("company_id", companyId)
        .eq("role", "ceo")
        .maybeSingle();

      if (ceoErr) throw ceoErr;
      updatedCeo = ceoRow;
    }

    if (!updatedCompany) return null;

    // fetch plan data if any
    const { data: planData } = await this.supabase
      .from("subscription_plan")
      .select("*")
      .eq("id", updatedCompany.plan_id)
      .maybeSingle();

    return CompanyDataMapper.toDomain({
      ...updatedCompany,
      ...(planData || {}),
      ...(updatedCeo || {}),
    });
  }

  // ------------------------------------------------------------------
  // PRODUCTS
  // ------------------------------------------------------------------
  async createProduct(
    companyId: string,
    data: Omit<Product, "id" | "companyId"> & {
      tiers: Omit<ProductTier, "id" | "productId">;
    },
  ): Promise<Product> {
    const { data: DBproduct, error } = await this.supabase
      .from("product")
      .insert(ProductMapper.toInsert(data, companyId))
      .select()
      .single();

    if (error) throw error;

    let product = ProductMapper.toDomain(DBproduct);

    data.tiers.map(async (tier) => {
      const { data: t, error } = await this.supabase
        .from("product_price_tier")
        .insert(
          ProductPriceTierMapper.toInsert({ ...tier, productId: DBproduct.id }),
        )
        .select()
        .single();

      if (error) throw error;

      if (product.tiers) {
        product.tiers.push(t);
      } else {
        product.tiers = [t];
      }
    });
    return product;
  }

  async getProduct(companyId: string, id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from("product")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    const productData = ProductMapper.toDomain(data);

    const { data: d, error: e } = await this.supabase
      .from("product_price_tier")
      .select("*")
      .eq("product_id", data.productId);

    if (e || !d) {
      return { ...productData, tiers: [] };
    }

    return { ...productData, tiers: d };
  }

  async getAllProducts(companyId: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from("product")
      .select("*, product_price_tier (*)")
      .eq("company_id", companyId);

    if (error || !data) return [];
    const productData = data.map((d) => ProductMapper.toDomain(d));

    return productData;
  }

  async updateProduct(
    companyId: string,
    id: string,
    data: Partial<Product>,
  ): Promise<Product | null> {
    return this.update(
      "product",
      companyId,
      id,
      ProductMapper.toUpdate(data),
      ProductMapper.toDomain,
    );
  }

  async deleteProduct(companyId: string, id: string): Promise<boolean> {
    return this.delete("product", companyId, id);
  }

  /* Product Price Tiers */

  async createProductPriceTier(
    data: Omit<ProductTier, "id">,
  ): Promise<ProductTier> {
    return this.create(
      "product_price_tier",
      ProductPriceTierMapper.toInsert(data),
      ProductPriceTierMapper.toDomain,
    );
  }

  // gets an array of all the product tiers related to the product ID supplied
  async getProductPriceTier(productId: string): Promise<ProductTier[]> {
    const { data, error } = await this.supabase
      .from("product_price_tier")
      .select("*")
      .eq("product_id", productId);

    if (error || !data) return [];
    return data.map(ProductPriceTierMapper.toDomain);
  }

  async updateProductPriceTier(
    id: string,
    data: Partial<ProductTier>,
  ): Promise<ProductTier | null> {
    const { data: d, error } = await this.supabase
      .from("product_price_tier")
      .update(data as any)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return ProductPriceTierMapper.toDomain(d);
  }

  /**
   * Fetch all inventory items for a specific logistics company
   */
  async getByLogisticsCompanyId(
    logisticsCompanyId: string,
  ): Promise<LogisticsInventoryItem[]> {
    const { data, error } = await this.supabase
      .from("logistics_inventory")
      .select("*")
      .eq("logistics_company_id", logisticsCompanyId);

    if (error) throw error;
    return (data || []).map(LogisticsInventoryMapper.toDomain);
  }

  /**
   * Fetch a single inventory item
   */
  async getInventoryItemById(
    id: string,
  ): Promise<LogisticsInventoryItem | null> {
    const { data, error } = await this.supabase
      .from("logistics_inventory")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
    return data ? LogisticsInventoryMapper.toDomain(data) : null;
  }

  /**
   * Create a new inventory item for a logistics company
   */
  async createInventoryItem(
    logisticsCompanyId: string,
    data: LogisticsInventoryItem,
  ): Promise<LogisticsInventoryItem> {
    const insertData = LogisticsInventoryMapper.toInsert(
      logisticsCompanyId,
      data,
    );

    const { data: created, error } = await this.supabase
      .from("logistics_inventory")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return LogisticsInventoryMapper.toDomain(created);
  }

  /**
   * Create multiple inventory items at once
   */
  async createBatch(
    logisticsCompanyId: string,
    items: LogisticsInventoryItem[],
  ): Promise<LogisticsInventoryItem[]> {
    const insertData = items.map((item) =>
      LogisticsInventoryMapper.toInsert(logisticsCompanyId, item),
    );

    const { data, error } = await this.supabase
      .from("logistics_inventory")
      .insert(insertData)
      .select();

    if (error) throw error;
    return (data || []).map(LogisticsInventoryMapper.toDomain);
  }

  /**
   * Update an inventory item
   */
  async updateInventoryItem(
    id: string,
    data: Partial<LogisticsInventoryItem>,
  ): Promise<LogisticsInventoryItem> {
    const updateData = LogisticsInventoryMapper.toUpdate(
      data as LogisticsInventoryItem,
    );

    const { data: updated, error } = await this.supabase
      .from("logistics_inventory")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return LogisticsInventoryMapper.toDomain(updated);
  }

  /**
   * Update multiple inventory items by logistics company
   * Replaces entire inventory for a logistics company
   */
  async batchUpdateInventory(
    logisticsCompanyId: string,
    items: LogisticsInventoryItem[],
  ): Promise<LogisticsInventoryItem[]> {
    // First, delete all existing inventory for this company
    const { error: deleteError } = await this.supabase
      .from("logistics_inventory")
      .delete()
      .eq("logistics_company_id", logisticsCompanyId);

    if (deleteError) throw deleteError;

    // If there are items to insert, insert them
    if (items.length === 0) return [];

    return this.createBatch(logisticsCompanyId, items);
  }

  /**
   * Delete an inventory item
   */
  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("logistics_inventory")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Delete all inventory items for a logistics company
   * (Called when deleting a logistics company)
   */
  async deleteByLogisticsCompanyId(logisticsCompanyId: string): Promise<void> {
    const { error } = await this.supabase
      .from("logistics_inventory")
      .delete()
      .eq("logistics_company_id", logisticsCompanyId);

    if (error) throw error;
  }

  /**
   * Check if product exists in inventory for a logistics company
   */
  async productExists(
    logisticsCompanyId: string,
    productId: string,
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("logistics_inventory")
      .select("id")
      .eq("logistics_company_id", logisticsCompanyId)
      .eq("product_id", productId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  }

  // ------------------------------------------------------------------
  // LOGISTICS
  // ------------------------------------------------------------------
  async createLogistics(
    companyId: string,
    data: Omit<LogisticsCompany, "id" | "companyId">,
  ): Promise<LogisticsCompany> {
    /* will both create an agent(logistics) and their inventory, if given */
    const { data: agent, error } = await this.supabase
      .from("logistics_company")
      .insert(LogisticsMapper.toInsert(data, companyId))
      .select()
      .single();

    if (error) {
      throw error;
    }

    const agentInDomain = LogisticsMapper.toDomain(agent);

    if (!data.inventory) {
      return agentInDomain;
    }

    const inventory = [];

    for (let i of data.inventory) {
      const { data: j, error: e } = await this.supabase
        .from("logistics_inventory")
        .insert(LogisticsInventoryMapper.toInsert(agentInDomain.id, i))
        .select()
        .single();

      if (e) {
        throw error;
      }
      inventory.push(j);
    }

    return {
      ...agentInDomain,
      inventory: inventory,
    };
  }

  async getLogistics(
    companyId: string,
    id: string,
  ): Promise<LogisticsCompany | null> {
    const { data, error } = await this.supabase
      .from("logistics_company")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    const { data: inventory, error: e } = await this.supabase
      .from("logistics_inventory")
      .select()
      .eq("logistics_company_id", data.id);

    if (e) {
      throw error;
    }

    const d = {
      ...LogisticsMapper.toDomain(data),
      inventory: inventory.map((i) => LogisticsInventoryMapper.toDomain(i)),
    };

    return d;
  }

  async getAllLogistics(companyId: string): Promise<LogisticsCompany[]> {
    // 1. Fetch logistics companies
    const { data: companies, error: companiesError } = await this.supabase
      .from("logistics_company")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (companiesError) throw companiesError;
    if (!companies || companies.length === 0) return [];

    // 2. Fetch inventory rows
    const companyIds = companies.map((c) => c.id);
    const { data: inventoryRows, error: inventoryError } = await this.supabase
      .from("logistics_inventory")
      .select("*")
      .in("logistics_company_id", companyIds);

    if (inventoryError) throw inventoryError;

    // 3. Map inventory rows using LogisticsInventoryMapper.toDomain
    const inventoryMap = new Map<string, LogisticsInventoryItem[]>();
    (inventoryRows ?? []).forEach((row) => {
      const domainItem = LogisticsInventoryMapper.toDomain(row);
      const existing = inventoryMap.get(row.logistics_company_id) || [];
      inventoryMap.set(row.logistics_company_id, [...existing, domainItem]);
    });

    // 4. Attach mapped inventory to companies
    return companies.map((company) => ({
      ...company,
      inventory: inventoryMap.get(company.id) || [],
    })) as LogisticsCompany[];
  }

  async updateLogistics(
    companyId: string,
    id: string,
    data: Partial<LogisticsCompany>,
  ): Promise<LogisticsCompany | null> {
    console.log("this is what's coming in", data);

    const { data: result, error } = await this.supabase
      .from("logistics_company")
      .update(LogisticsMapper.toUpdate(data))
      .eq("company_id", companyId)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data.inventory) {
      return result ? LogisticsMapper.toDomain(result) : null;
    }

    const inventory = [];

    for (let i of data.inventory) {
      // we are forcing a create right now, but I don't necessary know if
      // the user will be creating or updating here
      const { data: d, error: e } = await this.supabase
        .from("logistics_inventory")
        .insert(LogisticsInventoryMapper.toInsert(result.id, i))
        .eq("company_id", companyId)
        .select();

      if (e) {
        throw error;
      }

      inventory.push(LogisticsInventoryMapper.toDomain(d));
    }

    return {
      ...LogisticsMapper.toDomain(result),
      inventory,
    };
  }

  async deleteLogistics(companyId: string, id: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from("logistics_company")
      .delete({ count: "exact" })
      .eq("company_id", companyId)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return (count ?? 0) > 0;
  }

  // ------------------------------------------------------------------
  // ORDERS
  // ------------------------------------------------------------------
  async createOrder(
    companyId: string,
    data: Omit<Order, "id" | "companyId">,
  ): Promise<Order> {
    const { data: d, error } = await this.supabase
      .from("orders")
      .insert(OrderMapper.toInsert(data, companyId))
      .select(
        `
    *,
    previous_order:orders!previous_order_id(*)
  `,
      )
      .single();

    if (!d || error) throw error;

    return OrderMapper.toDomain(d);
  }

  async getOrder(companyId: string, id: string): Promise<Order | null> {
    return this.read("orders", companyId, id, OrderMapper.toDomain);
  }

  async getAllOrders(companyId: string): Promise<Order[]> {
    return this.readAll("orders", companyId, OrderMapper.toDomain);
  }

  async updateOrder(
    companyId: string,
    id: string,
    data: Partial<Order>,
  ): Promise<Order | null> {
    return this.update(
      "orders",
      companyId,
      id,
      OrderMapper.toUpdate(data),
      OrderMapper.toDomain,
    );
  }

  async deleteOrder(companyId: string, id: string): Promise<boolean> {
    return this.delete("orders", companyId, id);
  }

  // ------------------------------------------------------------------
  // TASKS
  // ------------------------------------------------------------------
  async createTask(
    companyId: string,
    data: Omit<Task, "id" | "companyId">,
  ): Promise<Task> {
    return this.create(
      "task",
      TaskMapper.toInsert(data, companyId),
      TaskMapper.toDomain,
    );
  }

  async getTask(companyId: string, id: string): Promise<Task | null> {
    return this.read("task", companyId, id, TaskMapper.toDomain);
  }

  async getAllTasks(companyId: string): Promise<Task[]> {
    return this.readAll("task", companyId, TaskMapper.toDomain);
  }

  async updateTask(
    companyId: string,
    id: string,
    data: Partial<Task>,
  ): Promise<Task | null> {
    return this.update(
      "task",
      companyId,
      id,
      TaskMapper.toUpdate(data),
      TaskMapper.toDomain,
    );
  }

  async deleteTask(companyId: string, id: string): Promise<boolean> {
    return this.delete("task", companyId, id);
  }

  // ------------------------------------------------------------------
  // MESSAGES
  // ------------------------------------------------------------------
  async createMessage(
    companyId: string,
    data: Omit<ChatMessage, "id" | "companyId">,
  ): Promise<ChatMessage> {
    return this.create(
      "chat_message",
      MessageMapper.toInsert(data, companyId),
      MessageMapper.toDomain,
    );
  }

  async getMessage(companyId: string, id: string): Promise<ChatMessage | null> {
    return this.read("chat_message", companyId, id, MessageMapper.toDomain);
  }

  async getAllMessages(companyId: string): Promise<ChatMessage[]> {
    return this.readAll("chat_message", companyId, MessageMapper.toDomain);
  }

  async updateMessage(
    companyId: string,
    id: string,
    data: Partial<ChatMessage>,
  ): Promise<ChatMessage | null> {
    return this.update(
      "chat_message",
      companyId,
      id,
      MessageMapper.toUpdate(data),
      MessageMapper.toDomain,
    );
  }

  async deleteMessage(companyId: string, id: string): Promise<boolean> {
    return this.delete("chat_message", companyId, id);
  }

  // ------------------------------------------------------------------
  // EXPENSES
  // ------------------------------------------------------------------
  async createExpense(
    companyId: string,
    data: Omit<Expense, "id" | "companyId">,
  ): Promise<Expense> {
    return this.create(
      "expense",
      ExpenseMapper.toInsert(data, companyId),
      ExpenseMapper.toDomain,
    );
  }

  async getExpense(companyId: string, id: string): Promise<Expense | null> {
    return this.read("expense", companyId, id, ExpenseMapper.toDomain);
  }

  async getAllExpenses(companyId: string): Promise<Expense[]> {
    return this.readAll("expense", companyId, ExpenseMapper.toDomain);
  }

  async updateExpense(
    companyId: string,
    id: string,
    data: Partial<Expense>,
  ): Promise<Expense | null> {
    return this.update(
      "expense",
      companyId,
      id,
      ExpenseMapper.toUpdate(data),
      ExpenseMapper.toDomain,
    );
  }

  async getLogisticsInventory(
    logisticsCompanyId: string,
  ): Promise<LogisticsInventoryItem[]> {
    const { data, error } = await this.supabase
      .from("logistics_inventory")
      .select("*")
      .eq("logistics_company_id", logisticsCompanyId);

    if (error) throw error;

    return (data ?? []).map(LogisticsInventoryMapper.toDomain);
  }

  async updateLogisticsInventory(
    logisticsCompanyId: string,
    data: LogisticsInventoryItem[],
  ): Promise<LogisticsInventoryItem[]> {
    /* okay, so to avoid the problem where updating turns to duplicates, we delete first then re-create*/

    const { error: deleteError } = await this.supabase
      .from("logistics_inventory")
      .delete()
      .eq("logistics_company_id", logisticsCompanyId);

    if (deleteError) throw deleteError;

    if (data.length === 0) {
      return [];
    }

    const { data: d, error } = await this.supabase
      .from("logistics_inventory")
      .insert(
        data.map((i) =>
          LogisticsInventoryMapper.toInsert(logisticsCompanyId, i),
        ),
      )
      .select();

    if (error) throw error;

    return d.map(LogisticsInventoryMapper.toDomain);
  }

  async upsertLogisticsInventory(
    logisticsCompanyId: string,
    inventory: LogisticsInventoryItem[],
  ): Promise<LogisticsInventoryItem[]> {
    const { data, error } = await this.supabase
      .from("logistics_inventory")
      .upsert(
        inventory.map((i) =>
          LogisticsInventoryMapper.toInsert(logisticsCompanyId, i),
        ),
        {
          onConflict: "logistics_company_id,product_id",
        },
      )
      .select();

    if (error) throw error;

    return data.map(LogisticsInventoryMapper.toDomain);
  }

  async deleteLogisticsInventoryItem(
    logisticsCompanyId: string,
    productId: string,
  ): Promise<boolean> {
    const { error, count } = await this.supabase
      .from("logistics_inventory")
      .delete({ count: "exact" })
      .eq("logistics_company_id", logisticsCompanyId)
      .eq("product_id", productId);

    if (error) throw error;

    return (count ?? 0) > 0;
  }

  async deleteExpense(companyId: string, id: string): Promise<boolean> {
    return this.delete("expense", companyId, id);
  }

  // Helper methods

  async getNextOrderSerial(companyId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("orders")
      .select("serial_number")
      .eq("company_id", companyId)
      .order("serial_number", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 1;
    }

    return data[0].serial_number + 1;
  }

  async checkReturnCustomer(
    companyId: string,
    phone: string,
    whatsapp?: string,
  ): Promise<{
    isReturn: boolean;
    previousDelivered: number | null;
    previousUncommitted: boolean;
  }> {
    const orders = await this.getAllOrders(companyId);

    const phones = [phone, whatsapp].filter(Boolean) as string[];

    const matched = orders.filter((order) =>
      phones.some((p) => orderMatchesPhone(order, p)),
    );

    const delivered = matched.find((o) => o.orderStatus === "delivered");

    const hasUncommitted = matched.some(
      (o) => o.orderStatus === "pending" || o.orderStatus === "uncommitted",
    );

    return {
      isReturn: matched.length > 0,
      previousDelivered: delivered?.serialNumber ?? null,
      previousUncommitted: hasUncommitted,
    };
  }

  async exportCompanyBackup(companyId: string): Promise<string> {
    const [staff, products, logistics, orders, tasks, messages, expenses] =
      await Promise.all([
        this.getAllStaff(companyId),
        this.getAllProducts(companyId),
        this.getAllLogistics(companyId),
        this.getAllOrders(companyId),
        this.getAllTasks(companyId),
        this.getAllMessages(companyId),
        this.getAllExpenses(companyId),
      ]);

    return JSON.stringify(
      { staff, products, logistics, orders, tasks, messages, expenses },
      null,
      2,
    );
  }

  private async bulkInsert<T extends Record<string, unknown>>(
    table: TableName,
    companyId: string,
    rows?: T[],
  ): Promise<void> {
    if (!rows?.length) return;
    const payload = rows.map((row) => ({ ...row, company_id: companyId }));
    const { error } = await this.supabase.from(table).insert(payload as any);
    if (error) throw error;
  }

  private async deleteAll(
    table: TableName,
    companyId: string,
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq("company_id", companyId);

    return !error;
  }

  async importCompanyBackup(companyId: string, json: string): Promise<boolean> {
    try {
      const backup = JSON.parse(json);

      await Promise.all([
        this.deleteAll("profile", companyId),
        this.deleteAll("product", companyId),
        this.deleteAll("logistics_company", companyId),
        this.deleteAll("orders", companyId),
        this.deleteAll("task", companyId),
        this.deleteAll("messages", companyId),
        this.deleteAll("expenses", companyId),
      ]);

      await Promise.all([
        this.bulkInsert("profiles", companyId, backup.staff),
        this.bulkInsert("products", companyId, backup.products),
        this.bulkInsert("logistics", companyId, backup.logistics),
        this.bulkInsert("orders", companyId, backup.orders),
        this.bulkInsert("tasks", companyId, backup.tasks),
        this.bulkInsert("messages", companyId, backup.messages),
        this.bulkInsert("expenses", companyId, backup.expenses),
      ]);

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

// Phone normalization
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("234") && digits.length > 10) digits = digits.slice(3);
  if (digits.startsWith("0") && digits.length > 9) digits = digits.slice(1);
  return digits;
}
export function phonesMatch(a: string, b: string): boolean {
  return !!a && !!b && normalizePhone(a) === normalizePhone(b);
}
export function orderMatchesPhone(order: Order, phone: string): boolean {
  const n = normalizePhone(phone);
  if (!n) return false;
  return (
    normalizePhone(order.phoneNumber) === n ||
    normalizePhone(order.whatsappNumber) === n
  );
}
export function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString();
}

export function calculateExpectedRevenue(
  products: Product[],
  logistics: LogisticsCompany[],
  tierName: string,
): number {
  let total = 0;
  logistics.forEach((loc) => {
    loc.inventory.forEach((inv) => {
      const p = products.find((x) => x.id === inv.productId);
      if (p) {
        const t = p.tiers.find((x) => x.name === tierName);
        if (t) total += t.sellingPrice * inv.quantity;
      }
    });
  });
  return total;
}

export function getTotalStockValue(
  products: Product[],
  logistics: LogisticsCompany[],
) {
  let totalUnits = 0,
    costValue = 0,
    retailValue = 0,
    wholesaleValue = 0;
  logistics.forEach((loc) => {
    loc.inventory.forEach((inv) => {
      const p = products.find((x) => x.id === inv.productId);
      if (p) {
        totalUnits += inv.quantity;
        costValue += (p.tiers[0]?.costPrice || 0) * inv.quantity;
        retailValue +=
          (p.tiers.find((t) => t.name === "Retail")?.sellingPrice || 0) *
          inv.quantity;
        wholesaleValue +=
          (p.tiers.find((t) => t.name === "Wholesale")?.sellingPrice || 0) *
          inv.quantity;
      }
    });
  });
  return { totalUnits, costValue, retailValue, wholesaleValue };
}

export type DateRange =
  "daily" | "weekly" | "monthly" | "yearly" | "custom" | "infinite";
export function getDateRangeFilter(
  range: DateRange,
  customStart?: string,
  _customEnd?: string,
) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  let start: Date;
  switch (range) {
    case "daily":
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case "custom":
      start = customStart ? new Date(customStart) : new Date(0);
      break;
    default:
      start = new Date(0);
  }
  return { start, end };
}

export function calculateProfitLoss(
  orders: Order[],
  expenses: Expense[],
  range: DateRange,
  customStart?: string,
  customEnd?: string,
) {
  const { start, end } = getDateRangeFilter(range, customStart, customEnd);
  const fo = orders.filter((o) => {
    if (o.orderStatus !== "delivered") return false;
    const d = new Date(o.actualDeliveryDate || o.orderDate);
    return d >= start && d <= end;
  });
  const fe = expenses.filter((e) => {
    if (e.status !== "approved") return false;
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
  const totalRevenue = fo.reduce((s, o) => s + o.amountPaid, 0);
  const totalCost = fo.reduce((s, o) => s + o.totalCost, 0);
  const totalDeliveryFees = fo.reduce((s, o) => s + o.deliveryFee, 0);
  const totalExpenses = fe.reduce((s, e) => s + e.amount, 0);
  return {
    totalRevenue,
    totalCost,
    totalDeliveryFees,
    totalExpenses,
    netProfit: totalRevenue - totalCost - totalDeliveryFees - totalExpenses,
    orderCount: fo.length,
    expenseCount: fe.length,
  };
}

// All order status labels
export const ORDER_STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
  color: string;
}[] = [
    { value: "pending", label: "Pending", color: "bg-amber-50 text-amber-700" },
    { value: "confirmed", label: "Confirmed", color: "bg-blue-50 text-blue-700" },
    { value: "shipped", label: "Shipped", color: "bg-purple-50 text-purple-700" },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-green-50 text-green-700",
    },
    {
      value: "uncommitted",
      label: "Uncommitted",
      color: "bg-gray-100 text-gray-600",
    },
    { value: "rejected", label: "Rejected", color: "bg-red-50 text-red-700" },
    { value: "failed", label: "Failed", color: "bg-red-100 text-red-800" },
    {
      value: "not-reachable",
      label: "Not Reachable",
      color: "bg-orange-50 text-orange-700",
    },
    {
      value: "not-picking",
      label: "Not Picking",
      color: "bg-orange-100 text-orange-800",
    },
    { value: "next-week", label: "Next Week", color: "bg-sky-50 text-sky-700" },
    {
      value: "changed-date",
      label: "Changed Date",
      color: "bg-indigo-50 text-indigo-700",
    },
  ];

export function getOrderStatusColor(status: OrderStatus): string {
  return (
    ORDER_STATUS_OPTIONS.find((o) => o.value === status)?.color ||
    "bg-gray-100 text-gray-600"
  );
}

type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
type TableName = keyof Database["public"]["Tables"];

// // Use consistent table names everywhere
// const DB_TABLES = {
//   staff: "profiles",
//   products: "products",
//   logistics: "logistics",
//   orders: "orders",
//   tasks: "tasks",
//   messages: "messages",
//   expenses: "expenses",
// } as const;

export const dataStore = new CompanyDataStore(supabase);
