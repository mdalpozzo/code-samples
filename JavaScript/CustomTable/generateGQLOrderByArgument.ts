interface OrderByArgs {
  orderPath: string;
  orderValue?: 'desc' | 'asc';
}

const recursivelyGenerateOrderBy = (
  orderParts: Array<string>,
  orderValue: 'desc' | 'asc'
): Record<string, any> => {
  const newOrderByNestScope: Record<string, any> = {};

  const newParts = [...orderParts];
  const currentPath = newParts.shift();

  // if newParts length is 0 then we are at the end of the path
  if (newParts.length === 0 && currentPath) {
    newOrderByNestScope[currentPath] = orderValue;
    return newOrderByNestScope;
  }

  // otherwise we set up a new blank nested order
  if (currentPath) {
    newOrderByNestScope[currentPath] = recursivelyGenerateOrderBy(newParts, orderValue);
  }

  // something went wrong
  return newOrderByNestScope;
};

export const generateGQLOrderByArgument = ({
  orderPath, // e.g. 'booking.end_date'
  orderValue = 'desc',
}: OrderByArgs): Record<string, any> => {
  if (!orderPath) {
    return {};
  }

  const orderParts = orderPath.split('.');

  const finalOrderByObject = recursivelyGenerateOrderBy(orderParts, orderValue);
  return finalOrderByObject;
};
