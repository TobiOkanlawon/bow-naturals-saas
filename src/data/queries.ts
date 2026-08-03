import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { CreateStaffRequest, dataStore } from "@/data/store";

/* ---------- Shared utility types ---------- */
type AsyncData<T extends (...args: any[]) => Promise<any>> = Awaited<
  ReturnType<T>
>;
type Arg1<T extends (...args: any[]) => any> = Parameters<T>[0];
type Arg2<T extends (...args: any[]) => any> = Parameters<T>[1];
type Arg3<T extends (...args: any[]) => any> = Parameters<T>[2];

type CompanyVars = { companyId: string };
type ByIdVars = CompanyVars & { id: string };
type CreateVars<TData> = CompanyVars & { data: TData };
type UpdateVars<TData> = ByIdVars & { data: TData };

type QueryResult<T> = UseQueryResult<T, Error>;
type MutationResult<TData, TVars> = UseMutationResult<TData, Error, TVars>;

/* ---------- Staff types ---------- */
export type StaffListData = AsyncData<typeof dataStore.getAllStaff>;
export type StaffItemData = AsyncData<typeof dataStore.getStaff>;
export type CreateStaffData = Arg2<typeof dataStore.createStaff>; // Omit<StaffMember, "id" | "companyId">
export type UpdateStaffData = Arg3<typeof dataStore.updateStaff>; // Partial<StaffMember>

export type UseStaffResult = QueryResult<StaffListData>;
export type UseStaffMemberResult = QueryResult<StaffItemData>;
export type UseCreateStaffResult = MutationResult<
  StaffItemData,
  CreateVars<CreateStaffData>
>;
export type UseUpdateStaffResult = MutationResult<
  StaffItemData,
  UpdateVars<UpdateStaffData>
>;
export type UseDeleteStaffResult = MutationResult<unknown, ByIdVars>;

/* ---------- Products types ---------- */
export type ProductsListData = AsyncData<typeof dataStore.getAllProducts>;
export type ProductItemData = AsyncData<typeof dataStore.getProduct>;
export type CreateProductData = Arg2<typeof dataStore.createProduct>;
export type UpdateProductData = Arg3<typeof dataStore.updateProduct>;

export type UseProductsResult = QueryResult<ProductsListData>;
export type UseProductResult = QueryResult<ProductItemData>;
export type UseCreateProductResult = MutationResult<
  ProductItemData,
  CreateVars<CreateProductData>
>;
export type UseUpdateProductResult = MutationResult<
  ProductItemData,
  UpdateVars<UpdateProductData>
>;
export type UseDeleteProductResult = MutationResult<unknown, ByIdVars>;

/* ---------- Logistics types ---------- */
export type LogisticsListData = AsyncData<typeof dataStore.getAllLogistics>;
export type LogisticsItemData = AsyncData<typeof dataStore.getLogistics>;
export type CreateLogisticsData = Arg2<typeof dataStore.createLogistics>;
export type UpdateLogisticsData = Arg3<typeof dataStore.updateLogistics>;

export type UseLogisticsResult = QueryResult<LogisticsListData>;
export type UseLogisticsCompanyResult = QueryResult<LogisticsItemData>;
export type UseCreateLogisticsResult = MutationResult<
  LogisticsItemData,
  CreateVars<CreateLogisticsData>
>;
export type UseUpdateLogisticsResult = MutationResult<
  LogisticsItemData,
  UpdateVars<UpdateLogisticsData>
>;
export type UseDeleteLogisticsResult = MutationResult<unknown, ByIdVars>;

/* ---------- Orders types ---------- */
export type OrdersListData = AsyncData<typeof dataStore.getAllOrders>;
export type OrderItemData = AsyncData<typeof dataStore.getOrder>;
export type CreateOrderData = Arg2<typeof dataStore.createOrder>;
export type UpdateOrderData = Arg3<typeof dataStore.updateOrder>;

export type UseOrdersResult = QueryResult<OrdersListData>;
export type UseOrderResult = QueryResult<OrderItemData>;
export type UseCreateOrderResult = MutationResult<
  OrderItemData,
  CreateVars<CreateOrderData>
>;
export type UseUpdateOrderResult = MutationResult<
  OrderItemData,
  UpdateVars<UpdateOrderData>
>;
export type UseDeleteOrderResult = MutationResult<unknown, ByIdVars>;

/* ---------- Tasks types ---------- */
export type TasksListData = AsyncData<typeof dataStore.getAllTasks>;
export type TaskItemData = AsyncData<typeof dataStore.getTask>;
export type CreateTaskData = Arg2<typeof dataStore.createTask>;
export type UpdateTaskData = Arg3<typeof dataStore.updateTask>;

export type UseTasksResult = QueryResult<TasksListData>;
export type UseTaskResult = QueryResult<TaskItemData>;
export type UseCreateTaskResult = MutationResult<
  TaskItemData,
  CreateVars<CreateTaskData>
>;
export type UseUpdateTaskResult = MutationResult<
  TaskItemData,
  UpdateVars<UpdateTaskData>
>;
export type UseDeleteTaskResult = MutationResult<unknown, ByIdVars>;

/* ---------- Messages types ---------- */
export type MessagesListData = AsyncData<typeof dataStore.getAllMessages>;
export type MessageItemData = AsyncData<typeof dataStore.getMessage>;
export type CreateMessageData = Arg2<typeof dataStore.createMessage>;
export type UpdateMessageData = Arg3<typeof dataStore.updateMessage>;

export type UseMessagesResult = QueryResult<MessagesListData>;
export type UseMessageResult = QueryResult<MessageItemData>;
export type UseCreateMessageResult = MutationResult<
  MessageItemData,
  CreateVars<CreateMessageData>
>;
export type UseUpdateMessageResult = MutationResult<
  MessageItemData,
  UpdateVars<UpdateMessageData>
>;
export type UseDeleteMessageResult = MutationResult<unknown, ByIdVars>;

/* ---------- Expenses types ---------- */
export type ExpensesListData = AsyncData<typeof dataStore.getAllExpenses>;
export type ExpenseItemData = AsyncData<typeof dataStore.getExpense>;
export type CreateExpenseData = Arg2<typeof dataStore.createExpense>;
export type UpdateExpenseData = Arg3<typeof dataStore.updateExpense>;

export type UseExpensesResult = QueryResult<ExpensesListData>;
export type UseExpenseResult = QueryResult<ExpenseItemData>;
export type UseCreateExpenseResult = MutationResult<
  ExpenseItemData,
  CreateVars<CreateExpenseData>
>;
export type UseUpdateExpenseResult = MutationResult<
  ExpenseItemData,
  UpdateVars<UpdateExpenseData>
>;
export type UseDeleteExpenseResult = MutationResult<unknown, ByIdVars>;

export function createMutationHook<TData, TVariables>(
  mutationKey: string,
  mutationFn: any,
  options?: UseMutationOptions<TData, Error, TVariables>,
) {
  return () => {
    return useMutation({
      mutationKey: [mutationKey],
      mutationFn,
      ...options,
    });
  };
}

function updateMutationHook<TData>(
  key: string,
  fn: (companyId: string, id: string, data: TData) => Promise<unknown>,
) {
  return function() {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: ({
        companyId,
        id,
        data,
      }: {
        companyId: string;
        id: string;
        data: TData;
      }) => fn(companyId, id, data),

      onSuccess: (_, { companyId, id }) => {
        qc.invalidateQueries({ queryKey: [key, companyId] });
        qc.invalidateQueries({ queryKey: [key, companyId, id] });
      },
    });
  };
}

function deleteMutationHook(
  key: string,
  fn: (companyId: string, id: string) => Promise<unknown>,
) {
  return function() {
    const qc = useQueryClient();

    return useMutation({
      mutationFn: ({ companyId, id }: { companyId: string; id: string }) =>
        fn(companyId, id),

      onSuccess: (_, { companyId }) => {
        qc.invalidateQueries({ queryKey: [key, companyId] });
      },
    });
  };
}

/* aggregate data fetching tool to get all the data needed in the company context*/
export const useGetCompanyData = (companyId: string | undefined) => {
  return useQuery<Company>({
    queryKey: ["get-company", companyId],
    queryFn: () => dataStore.getCompanyData(companyId),
    enabled: !!companyId,
  });
}

export function useStaff(companyId: string) {
  return useQuery<StaffMember[]>({
    queryKey: ["staff", companyId],
    queryFn: () => dataStore.getAllStaff(companyId),
    enabled: !!companyId,
  });
}

export function useStaffMember(companyId: string, id: string) {
  return useQuery<StaffMember | null>({
    queryKey: ["staff", companyId, id],
    queryFn: () => dataStore.getStaff(companyId, id),
    enabled: !!companyId && !!id,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: CreateStaffRequest
    }) => dataStore.createStaff(companyId, data),

    onSuccess: (_, { companyId }) => {
      qc.invalidateQueries({ queryKey: ["staff", companyId] });
    },
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      id,
      data,
    }: {
      companyId: string;
      id: string;
      data: Partial<StaffMember>;
    }) => dataStore.updateStaff(companyId, id, data),

    onSuccess: (_, { companyId, id }) => {
      qc.invalidateQueries({ queryKey: ["staff", companyId] });
      qc.invalidateQueries({ queryKey: ["staff", companyId, id] });
    },
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, id }: { companyId: string; id: string }) =>
      dataStore.deleteStaff(companyId, id),

    onSuccess: (_, { companyId }) => {
      qc.invalidateQueries({ queryKey: ["staff", companyId] });
    },
  });
}

export const useProducts = (companyId: string) =>
  useQuery<Product[]>({
    queryKey: ["products", companyId],
    queryFn: () => dataStore.getAllProducts(companyId),
    enabled: !!companyId,
  });

export const useProduct = (companyId: string, id: string) =>
  useQuery({
    queryKey: ["products", companyId, id],
    queryFn: () => dataStore.getProduct(companyId, id),
    enabled: !!companyId && !!id,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-product"],
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: Omit<Product, "id" | "companyId"> & {
        tiers: Omit<ProductTier, "id" | "productId">;
      };
    }) => dataStore.createProduct(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useUpdateProduct = updateMutationHook("products", (c, id, d) =>
  dataStore.updateProduct(c, id, d),
);

// export const useUpdateInventory = updateMutationHook('logistics', (logisticsCompanyId, data) => dataStore.updateLogisticsInventory(logisticsCompanyId, data))

export const useUpdateInventory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["update-inventory"],
    mutationFn: ({
      logisticsCompanyId,
      data,
    }: {
      logisticsCompanyId: string;
      data: LogisticsInventoryItem[];
    }) => {
      return dataStore.updateLogisticsInventory(logisticsCompanyId, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["logistics"] });
    },
  });
};

export const useDeleteProduct = deleteMutationHook("products", (c, id) =>
  dataStore.deleteProduct(c, id),
);

export const useLogistics = (companyId: string) =>
  useQuery({
    queryKey: ["logistics", companyId],
    queryFn: () => dataStore.getAllLogistics(companyId),
    enabled: !!companyId,
  });

export const useLogisticsCompany = (companyId: string, id: string) =>
  useQuery({
    queryKey: ["logistics", companyId, id],
    queryFn: () => dataStore.getLogistics(companyId, id),
    enabled: !!companyId && !!id,
  });

export const useCreateLogistics = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: Omit<LogisticsCompany, "id" | "companyId">;
    }) => {
      return dataStore.createLogistics(companyId, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["logistics"],
      });
    },
  });
};

export const useUpdateLogistics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      id,
      data,
    }: {
      companyId: string;
      id: string;
      data: Partial<LogisticsCompany>;
    }) => dataStore.updateLogistics(companyId, id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["logistics"],
      }),
  });
};

export const useDeleteLogistics = deleteMutationHook("logistics", (c, id) =>
  dataStore.deleteLogistics(c, id),
);

export const updateLogisticsInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: LogisticsInventoryItem[];
    }) => dataStore.updateLogisticsInventory(companyId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["logistics"],
      }),
  });
};

export const useOrders = (companyId: string) =>
  useQuery({
    queryKey: ["orders", companyId],
    queryFn: () => dataStore.getAllOrders(companyId),
    enabled: !!companyId,
  });

export const useOrder = (companyId: string, id: string) =>
  useQuery({
    queryKey: ["orders", companyId, id],
    queryFn: () => dataStore.getOrder(companyId, id),
    enabled: !!companyId && !!id,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      data,
    }: {
      companyId: string;
      data: Omit<Order, "id" | "companyId">;
    }) => dataStore.createOrder(companyId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });
};

export const useUpdateOrder = updateMutationHook("orders", (c, id, d) =>
  dataStore.updateOrder(c, id, d),
);

export const useDeleteOrder = deleteMutationHook("orders", (c, id) =>
  dataStore.deleteOrder(c, id),
);

export const useTasks = (companyId: string) =>
  useQuery({
    queryKey: ["tasks", companyId],
    queryFn: () => dataStore.getAllTasks(companyId),
    enabled: !!companyId,
  });

export const useTask = (companyId: string, id: string) =>
  useQuery({
    queryKey: ["tasks", companyId, id],
    queryFn: () => dataStore.getTask(companyId, id),
    enabled: !!companyId && !!id,
  });

export const useCreateTask = createMutationHook("tasks", (c, d) =>
  dataStore.createTask(c, d),
);

export const useUpdateTask = updateMutationHook("tasks", (c, id, d) =>
  dataStore.updateTask(c, id, d),
);

export const useDeleteTask = deleteMutationHook("tasks", (c, id) =>
  dataStore.deleteTask(c, id),
);

export const useMessages = (companyId: string) =>
  useQuery({
    queryKey: ["messages", companyId],
    queryFn: () => dataStore.getAllMessages(companyId),
    enabled: !!companyId,
  });

export const useMessage = (companyId: string, id: string) =>
  useQuery({
    queryKey: ["messages", companyId, id],
    queryFn: () => dataStore.getMessage(companyId, id),
    enabled: !!companyId && !!id,
  });

export const useCreateMessage = createMutationHook("messages", (c, d) =>
  dataStore.createMessage(c, d),
);

export const useUpdateMessage = updateMutationHook("messages", (c, id, d) =>
  dataStore.updateMessage(c, id, d),
);

export const useDeleteMessage = deleteMutationHook("messages", (c, id) =>
  dataStore.deleteMessage(c, id),
);

export const useExpenses = (companyId: string) =>
  useQuery({
    queryKey: ["expenses", companyId],
    queryFn: () => dataStore.getAllExpenses(companyId),
    enabled: !!companyId,
  });

export const useExpense = (companyId: string, id: string) =>
  useQuery({
    queryKey: ["expenses", companyId, id],
    queryFn: () => dataStore.getExpense(companyId, id),
    enabled: !!companyId && !!id,
  });

export const useCreateExpense = createMutationHook("expenses", (c, d) =>
  dataStore.createExpense(c, d),
);

export const useUpdateExpense = updateMutationHook("expenses", (c, id, d) =>
  dataStore.updateExpense(c, id, d),
);

export const useDeleteExpense = deleteMutationHook("expenses", (c, id) =>
  dataStore.deleteExpense(c, id),
);

/**
 * Real-time query placeholder or subscription wrapper
 */
export function useLogisticsSubscription(companyId: string) {
  return useLogistics(companyId);
}
