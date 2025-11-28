export interface Post {
  id: string;
  user: {
    username: string;
    avatar: string;
    isVerified: boolean;
    location: string;
  };
  image: string;
  caption: string;
  date: string;
}

export const mockPosts: Post[] = [
  {
    id: '1',
    user: {
      username: 'joshua_l',
      avatar: 'https://i.pravatar.cc/150?u=joshua_l',
      isVerified: true,
      location: 'Tokyo, Japan',
    },
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=375&auto=format&fit=crop',
    caption: 'The game in Japan was amazing and I want to share some photos',
    date: 'September 19',
  },
  {
    id: '2',
    user: {
      username: 'sarah_travels',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      isVerified: true,
      location: 'Paris, France',
    },
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=375&auto=format&fit=crop',
    caption: 'Eiffel Tower at sunset never gets old 🗼✨',
    date: 'September 18',
  },
  {
    id: '3',
    user: {
      username: 'foodie_mike',
      avatar: 'https://i.pravatar.cc/150?u=mike',
      isVerified: false,
      location: 'New York, USA',
    },
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=375&auto=format&fit=crop',
    caption: 'Best brunch spot in Manhattan! Highly recommend 🍳',
    date: 'September 17',
  },
  {
    id: '4',
    user: {
      username: 'nature_explorer',
      avatar: 'https://i.pravatar.cc/150?u=nature',
      isVerified: true,
      location: 'Swiss Alps',
    },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=375&auto=format&fit=crop',
    caption: 'Mountain therapy 🏔️ Nothing beats this view',
    date: 'September 16',
  },
  {
    id: '5',
    user: {
      username: 'beach_lover',
      avatar: 'https://i.pravatar.cc/150?u=beach',
      isVerified: false,
      location: 'Maldives',
    },
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=375&auto=format&fit=crop',
    caption: 'Paradise found 🌴☀️',
    date: 'September 15',
  },
  {
    id: '6',
    user: {
      username: 'urban_photographer',
      avatar: 'https://i.pravatar.cc/150?u=urban',
      isVerified: true,
      location: 'Dubai, UAE',
    },
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=375&auto=format&fit=crop',
    caption: 'City lights and skyscrapers 🌃',
    date: 'September 14',
  },
  {
    id: '7',
    user: {
      username: 'coffee_addict',
      avatar: 'https://i.pravatar.cc/150?u=coffee',
      isVerified: false,
      location: 'Seattle, USA',
    },
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=375&auto=format&fit=crop',
    caption: 'Morning ritual ☕️ Perfect latte art',
    date: 'September 13',
  },
  {
    id: '8',
    user: {
      username: 'fitness_guru',
      avatar: 'https://i.pravatar.cc/150?u=fitness',
      isVerified: true,
      location: 'Los Angeles, USA',
    },
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=375&auto=format&fit=crop',
    caption: 'Leg day complete! 💪 No excuses',
    date: 'September 12',
  },
  {
    id: '9',
    user: {
      username: 'art_enthusiast',
      avatar: 'https://i.pravatar.cc/150?u=art',
      isVerified: false,
      location: 'Florence, Italy',
    },
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=375&auto=format&fit=crop',
    caption: 'Renaissance art at its finest 🎨',
    date: 'September 11',
  },
  {
    id: '10',
    user: {
      username: 'pet_lover',
      avatar: 'https://i.pravatar.cc/150?u=pet',
      isVerified: true,
      location: 'London, UK',
    },
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=375&auto=format&fit=crop',
    caption: 'Meet my new best friend! 🐕❤️',
    date: 'September 10',
  },
];
