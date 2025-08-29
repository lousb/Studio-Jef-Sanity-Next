import TextBox from '@/components/shared/TextBox'

const Image = ({ data = {} }) => {
  const { description } = data

  if (!description) return null
  return (
    
    <div className="divider mt-3">
          <TextBox
            description={description}
            classesWrapper="relative"
          />
    </div>
  )
}

export default Image