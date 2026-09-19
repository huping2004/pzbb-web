import { TrashPage } from "./TrashPage"
import { useTrash } from "./useTrash"

export default function TrashRoute() {
  const vm = useTrash()
  return <TrashPage {...vm} />
}
