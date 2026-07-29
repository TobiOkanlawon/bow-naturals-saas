export const ORDER_SELECT = `
  *,
  logistics_company:logistics_company(*),
  created_by_profile:profile!orders_created_by_fkey(*),
  previous_order:orders!orders_previous_order_id_fkey(*),
  order_items(
    *,
    product(*)
  )
`;
