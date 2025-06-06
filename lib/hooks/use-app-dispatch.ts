import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/lib/store/store'

// Use throughout your app instead of plain `useDispatch`
export const useAppDispatch: () => AppDispatch = useDispatch
