export const ORDER_SELECT = `
  *,
  logistics_company:logistics_company(*),
  created_by_profile:profile!orders_created_by_fkey(*),
  order_item(
    *,
    product(*)
  )
`;
