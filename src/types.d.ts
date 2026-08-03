interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RegisterResult {
  success: boolean;
  uid?: string;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    companyName: string,
    plan: string,
  ) => Promise<RegisterResult>;
  logout: () => Promise<void>;
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      chat_message: {
        Row: {
          channel: string | null;
          company_id: string;
          created_at: string | null;
          id: string;
          is_direct_message: boolean | null;
          message: string;
          recipient_id: number | null;
          recipient_name: string | null;
          sender: number | null;
          sender_role: string | null;
        };
        Insert: {
          channel?: string | null;
          company_id: string;
          created_at?: string | null;
          id?: string;
          is_direct_message?: boolean | null;
          message: string;
          recipient_id?: number | null;
          recipient_name?: string | null;
          sender?: number | null;
          sender_role?: string | null;
        };
        Update: {
          channel?: string | null;
          company_id?: string;
          created_at?: string | null;
          id?: string;
          is_direct_message?: boolean | null;
          message?: string;
          recipient_id?: number | null;
          recipient_name?: string | null;
          sender?: number | null;
          sender_role?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_message_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_message_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_message_sender_fkey";
            columns: ["sender"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
      company: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          plan_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string | null;
          plan_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string | null;
          plan_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plan";
            referencedColumns: ["id"];
          },
        ];
      };
      ermission: {
        Row: {
          can_add_edit_inventory: boolean;
          can_add_logistics: boolean;
          can_mark_delivered: boolean;
          user_id: number;
        };
        Insert: {
          can_add_edit_inventory?: boolean;
          can_add_logistics?: boolean;
          can_mark_delivered?: boolean;
          user_id: number;
        };
        Update: {
          can_add_edit_inventory?: boolean;
          can_add_logistics?: boolean;
          can_mark_delivered?: boolean;
          user_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ermission_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
      expense: {
        Row: {
          amount: number;
          category: string | null;
          company_id: string;
          created_at: string | null;
          date: string | null;
          description: string | null;
          id: string;
          receipt: string | null;
          status: string | null;
          submitted_by: number | null;
        };
        Insert: {
          amount: number;
          category?: string | null;
          company_id: string;
          created_at?: string | null;
          date?: string | null;
          description?: string | null;
          id?: string;
          receipt?: string | null;
          status?: string | null;
          submitted_by?: number | null;
        };
        Update: {
          amount?: number;
          category?: string | null;
          company_id?: string;
          created_at?: string | null;
          date?: string | null;
          description?: string | null;
          id?: string;
          receipt?: string | null;
          status?: string | null;
          submitted_by?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "expense_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expense_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
      logistics_company: {
        Row: {
          company_id: string;
          created_at: string | null;
          id: string;
          location: string | null;
          name: string;
          phone: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          id?: string;
          location?: string | null;
          name: string;
          phone?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          id?: string;
          location?: string | null;
          name?: string;
          phone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "logistics_company_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
        ];
      };
      logistics_inventory: {
        Row: {
          logistics_company_id: string;
          min_stock: number;
          product_id: string;
          quantity: number;
        };
        Insert: {
          logistics_company_id: string;
          min_stock?: number;
          product_id: string;
          quantity?: number;
        };
        Update: {
          logistics_company_id?: string;
          min_stock?: number;
          product_id?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "logistics_inventory_logistics_company_id_fkey";
            columns: ["logistics_company_id"];
            isOneToOne: false;
            referencedRelation: "logistics_company";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "logistics_inventory_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "product";
            referencedColumns: ["id"];
          },
        ];
      };
      order_item: {
        Row: {
          cost_price: number | null;
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string | null;
          quantity: number;
          stock_after_delivery: number | null;
          tier_name: string | null;
          unit_price: number | null;
        };
        Insert: {
          cost_price?: number | null;
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name?: string | null;
          quantity: number;
          stock_after_delivery?: number | null;
          tier_name?: string | null;
          unit_price?: number | null;
        };
        Update: {
          cost_price?: number | null;
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string | null;
          quantity?: number;
          stock_after_delivery?: number | null;
          tier_name?: string | null;
          unit_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_item_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_item_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "product";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          actual_delivery_date: string | null;
          amount_paid: number | null;
          city: string | null;
          company_id: string;
          created_at: string | null;
          created_by: number | null;
          customer_name: string;
          deal_type: string;
          delivery_address: string | null;
          delivery_fee: number | null;
          expected_delivery_date: string | null;
          follow_up_contacted_at: string | null;
          follow_up_date: string | null;
          follow_up_notes: string | null;
          follow_up_status: string | null;
          gross_profit: number | null;
          id: string;
          is_return_customer: boolean | null;
          logistics_company_id: string | null;
          logistics_location: string | null;
          notes: string | null;
          order_date: string | null;
          order_status: string;
          payment_status: string | null;
          phone_number: string | null;
          previous_order_id: string | null;
          serial_number: number;
          state: string | null;
          total_amount: number | null;
          total_cost: number | null;
          whatsapp_number: string | null;
        };
        Insert: {
          actual_delivery_date?: string | null;
          amount_paid?: number | null;
          city?: string | null;
          company_id: string;
          created_at?: string | null;
          created_by?: number | null;
          customer_name: string;
          deal_type: string;
          delivery_address?: string | null;
          delivery_fee?: number | null;
          expected_delivery_date?: string | null;
          follow_up_contacted_at?: string | null;
          follow_up_date?: string | null;
          follow_up_notes?: string | null;
          follow_up_status?: string | null;
          gross_profit?: number | null;
          id?: string;
          is_return_customer?: boolean | null;
          logistics_company_id?: string | null;
          logistics_location?: string | null;
          notes?: string | null;
          order_date?: string | null;
          order_status: string;
          payment_status?: string | null;
          phone_number?: string | null;
          previous_order_id?: string | null;
          serial_number: number;
          state?: string | null;
          total_amount?: number | null;
          total_cost?: number | null;
          whatsapp_number?: string | null;
        };
        Update: {
          actual_delivery_date?: string | null;
          amount_paid?: number | null;
          city?: string | null;
          company_id?: string;
          created_at?: string | null;
          created_by?: number | null;
          customer_name?: string;
          deal_type?: string;
          delivery_address?: string | null;
          delivery_fee?: number | null;
          expected_delivery_date?: string | null;
          follow_up_contacted_at?: string | null;
          follow_up_date?: string | null;
          follow_up_notes?: string | null;
          follow_up_status?: string | null;
          gross_profit?: number | null;
          id?: string;
          is_return_customer?: boolean | null;
          logistics_company_id?: string | null;
          logistics_location?: string | null;
          notes?: string | null;
          order_date?: string | null;
          order_status?: string;
          payment_status?: string | null;
          phone_number?: string | null;
          previous_order_id?: string | null;
          serial_number?: number;
          state?: string | null;
          total_amount?: number | null;
          total_cost?: number | null;
          whatsapp_number?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_logistics_company_id_fkey";
            columns: ["logistics_company_id"];
            isOneToOne: false;
            referencedRelation: "logistics_company";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_previous_order_id_fkey";
            columns: ["previous_order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      product: {
        Row: {
          benefits: string | null;
          category: string | null;
          company_id: string;
          created_at: string | null;
          id: string;
          image_url: string | null;
          name: string;
          status: string;
          total_stock: number;
          updated_at: string | null;
        };
        Insert: {
          benefits?: string | null;
          category?: string | null;
          company_id: string;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          status: string;
          total_stock?: number;
          updated_at?: string | null;
        };
        Update: {
          benefits?: string | null;
          category?: string | null;
          company_id?: string;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          status?: string;
          total_stock?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
        ];
      };
      product_price_tier: {
        Row: {
          cost_price: number;
          id: string;
          name: string;
          product_id: string;
          selling_price: number;
        };
        Insert: {
          cost_price: number;
          id?: string;
          name: string;
          product_id: string;
          selling_price: number;
        };
        Update: {
          cost_price?: number;
          id?: string;
          name?: string;
          product_id?: string;
          selling_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_price_tier_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "product";
            referencedColumns: ["id"];
          },
        ];
      };
      profile: {
        Row: {
          company_id: string | null;
          created_at: string;
          full_name: string;
          id: number;
          role: Database["public"]["Enums"]["role"];
          user_id: string | null;
          email: string;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string;
          full_name?: string;
          id?: number;
          role?: Database["public"]["Enums"]["role"];
          user_id?: string | null;
          email?: string | null;
        };
        Update: {
          company_id?: string | null;
          created_at?: string;
          full_name?: string;
          id?: number;
          role?: Database["public"]["Enums"]["role"];
          email?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
        ];
      };
      subscription_plan: {
        Row: {
          duration_days: number;
          id: number;
          name: string;
          paystack_code: string;
          price_in_kobo: number;
        };
        Insert: {
          duration_days: number;
          id?: number;
          name: string;
          paystack_code: string;
          price_in_kobo: number;
        };
        Update: {
          duration_days?: number;
          id?: number;
          name?: string;
          paystack_code?: string;
          price_in_kobo?: number;
        };
        Relationships: [];
      };
      task: {
        Row: {
          assignee: number | null;
          company_id: string;
          created_at: string | null;
          description: string | null;
          due_date: string | null;
          id: string;
          priority: string | null;
          status: string | null;
          title: string;
        };
        Insert: {
          assignee?: number | null;
          company_id: string;
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          status?: string | null;
          title: string;
        };
        Update: {
          assignee?: number | null;
          company_id?: string;
          created_at?: string | null;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string | null;
          status?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_assignee_fkey";
            columns: ["assignee"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "company";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      role: "superadmin" | "admin" | "staff" | "ceo";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

type Enums<
  DefaultSchemaEnumNameOrOptions extends
  keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      role: ["superadmin", "admin", "staff", "ceo"],
    },
  },
} as const;

interface StaffMember {
  id: number; // profile.id is 'number' in database
  userId?: string | null;
  companyId?: string | null;
  fullName: string;
  role?: UserRole;
  createdAt: string;
}

interface Product {
  id: string;
  companyId: string;
  name: string;
  status: string;
  totalStock: number;
  category?: string | null;
  benefits?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  tiers?: ProductTier[];
}

interface ProductTier {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  productId: string;
};

interface LogisticsCompany {
  id: string;
  companyId: string;
  name: string;
  phone?: string | null;
  location?: string | null;
  inventory?: LogisticsInventoryItem[];
  createdAt?: string | null;
}

interface Order {
  id: string;
  companyId: string;
  customerName: string;
  dealType: string;
  orderStatus: string;
  serialNumber: number;
  amountPaid?: number | null;
  totalAmount?: number | null;
  totalCost?: number | null;
  grossProfit?: number | null;
  deliveryFee?: number | null;
  city?: string | null;
  state?: string | null;
  deliveryAddress?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  notes?: string | null;
  orderDate?: string | null;
  expectedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  logisticsCompanyId?: string | null;
  logisticsLocation?: string | null;
  createdBy?: number | null;
  createdAt?: string | null;
}

interface Task {
  id: string;
  companyId: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  assignee?: number | null;
  dueDate?: string | null;
  createdAt?: string | null;
}

interface ChatMessage {
  id: string;
  companyId: string;
  message: string;
  sender?: number | null;
  senderRole?: string | null;
  recipientId?: number | null;
  recipientName?: string | null;
  channel?: string | null;
  isDirectMessage?: boolean | null;
  createdAt?: string | null;
}

interface Expense {
  id: string;
  companyId: string;
  amount: number;
  category?: string | null;
  description?: string | null;
  date?: string | null;
  receipt?: string | null;
  status?: string | null;
  submittedBy?: number | null;
  createdAt?: string | null;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "uncommitted"
  | "delivered"
  | "rejected"
  | "failed"
  | "not-reachable"
  | "not-picking"
  | "next-week"
  | "changed-date";

interface Order {
  id: string;
  companyId: string;
  serialNumber: number;
  customerName: string;
  phoneNumber: string;
  whatsappNumber: string;
  deliveryAddress: string;
  city: string;
  state: string;
  items: OrderItem[];
  dealType: "retail" | "wholesale" | "dm" | "custom";
  orderDate: string;
  expectedDeliveryDate: string;
  orderStatus: OrderStatus;
  deliveryFee: number;
  logisticsCompanyId: string;
  logisticsLocation: string;
  actualDeliveryDate: string;
  followUpDate: string;
  paymentStatus: "unpaid" | "partial" | "paid";
  amountPaid: number;
  totalAmount: number;
  totalCost: number;
  grossProfit: number;
  notes: string;
  createdBy: string;
  isReturnCustomer: boolean;
  previousOrderId: string | null;
  followUpStatus:
  | "pending"
  | "reached"
  | "responded"
  | "good-feedback"
  | "bad-feedback"
  | "no-answer";
  followUpNotes: string;
  followUpContactedAt: string;
}

interface Task {
  id: string;
  companyId: string;
  title: string;
  description: string;
  assignee: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in-progress" | "review" | "done";
  dueDate: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  companyId: string;
  sender: string;
  senderRole: "ceo" | "staff";
  message: string;
  timestamp: string;
  channel: string;
  recipientId?: string;
  recipientName?: string;
  isDirectMessage: boolean;
}

interface Expense {
  id: string;
  companyId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "approved" | "pending" | "rejected";
  submittedBy: string;
  receipt?: string;
}

/* The types that start with DB are database types */
type DBOrder = Tables<"orders">;
type DBProflie = Tables<"profile">;
type DBProduct = Tables<"product">;

type NewOrder = TablesInsert<"orders">;
type UpdateOrder = TablesInsert<"orders">;

type UserRole = Enums<"role">; // "superadmin" | "admin" | "staff" | "ceo"
// only staff and ceo are allowed in this app

interface LogisticsInventoryItem {
  productId: string;
  quantity: number;
  minStock: number;
}

interface Company {
  id: string;
  name: string;
  planId?: number;
  planName: string;
  ceoName: string;
  ceoEmail: string;
}
