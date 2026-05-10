export const EmptyState = ({ icon = '📭', title = 'Nothing here yet', description = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-gray-300 font-medium mb-1">{title}</h3>
    {description && <p className="text-gray-500 text-sm mb-4">{description}</p>}
    {action && (
      <button onClick={action.onClick} className="btn-primary text-sm mt-2">
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
