import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ServiceIcon } from '../data/content';

type Props = {
  icon: ServiceIcon;
  size?: number;
  color: string;
};

export function ServiceSportIcon({ icon, size = 24, color }: Props) {
  if (icon.set === 'material') {
    return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  }
  return <Ionicons name={icon.name} size={size} color={color} />;
}
