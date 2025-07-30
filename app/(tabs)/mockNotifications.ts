export type NotificationItem = {
  id: string;
  type: 'promotion' | 'text';
  username: string;
  subtitle?: string;
  profileImage: string;
  message?: string;
  promoTitle?: string;
  promoDetails?: string;
  promoDescription?: string;
  buttonText?: string;
};

export const notifications: NotificationItem[] = [
  {
    id: '1',
    type: 'promotion',
    username: 'Shark.11',
    subtitle: "Men's hair Salon",
    profileImage: 'https://via.placeholder.com/48',
    promoTitle: '50% off (up to $30)',
    promoDetails: 'Use by June 3, 2025',
    promoDescription: 'At select salons. Hair products or other items may not be eligible.',
    buttonText: 'Add offer',
  },
  {
    id: '2',
    type: 'text',
    username: 'Abhay.07',
    message: 'Liked your post.',
    profileImage: 'https://via.placeholder.com/48',
  },
  {
    id: '3',
    type: 'text',
    username: 'Abhay.07',
    message: 'Started following you.',
    profileImage: 'https://via.placeholder.com/48',
  },
  {
    id: '4',
    type: 'text',
    username: 'Shark.11',
    message: 'Tag in new post.',
    subtitle: "Men's hair Salon",
    profileImage: 'https://via.placeholder.com/48',
  },
  {
    id: '5',
    type: 'promotion',
    username: 'Shark.11',
    subtitle: "Men's hair Salon",
    profileImage: 'https://via.placeholder.com/48',
    promoTitle: '50% off (up to $30)',
    promoDetails: 'Use by June 3, 2025',
    promoDescription: 'At select salons. Hair products or other items may not be eligible.',
    buttonText: 'Add offer',
  },
]; 