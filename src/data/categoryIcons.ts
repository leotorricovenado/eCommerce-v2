import {
  CookingPot,
  Croissant,
  CupSoda,
  Droplets,
  GlassWater,
  IceCreamBowl,
  SprayCan,
  Utensils,
  Wheat,
  type LucideIcon,
} from "lucide-react"

export const categoryIcons: Record<string, LucideIcon> = {
  "limpieza-del-hogar": SprayCan,
  "cuidado-personal": Droplets,
  "bebidas-en-polvo": CupSoda,
  "bebidas-rtd": GlassWater,
  panificacion: Croissant,
  salsas: Utensils,
  culinarios: CookingPot,
  postres: IceCreamBowl,
  cereales: Wheat,
}
