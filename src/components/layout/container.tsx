export default function Container({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div 
      style={{ 
        maxWidth: '80rem', 
        marginLeft: 'auto', 
        marginRight: 'auto', 
        paddingLeft: '1.5rem', 
        paddingRight: '1.5rem',
        width: '100%',
        ...style 
      }} 
      className={className}
    >
      {children}
    </div>
  )
}
