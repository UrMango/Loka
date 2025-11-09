import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import DeleteIcon from '@mui/icons-material/Delete'
import type { MapLocation } from '../types/Trip.ts'

interface DraggableLocationProps {
  location: MapLocation
  index: number
  onMove: (dragIndex: number, hoverIndex: number) => void
  onRemove: (locationId: string) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

export const DraggableLocation = ({ location, index, onMove, onRemove }: DraggableLocationProps) => {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop({
    accept: 'location',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Get rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Get mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the item's height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      onMove(dragIndex, hoverIndex)

      // Note: we mutate the monitor item here to avoid expensive index searches
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: 'location',
    item: () => {
      return { id: location.id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  return (
    <ListItem
      component="div"
      ref={ref}
      data-handler-id={handlerId}
      sx={{
        opacity,
        bgcolor: 'background.paper',
        mb: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'move'
      }}
    >
      <DragIndicatorIcon sx={{ mr: 1 }} />
      <ListItemText
        primary={location.title}
        secondary={location.address}
      />
      <ListItemSecondaryAction>
        <IconButton 
          edge="end" 
          onClick={() => onRemove(location.id)}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default DraggableLocation