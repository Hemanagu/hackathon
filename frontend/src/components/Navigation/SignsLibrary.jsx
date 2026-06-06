import { useState } from 'react';

const SIGNS_DATA = [
  {
    name: 'Hello',
    emoji: '👋',
    gesture: 'Open palm wave',
    description: 'All fingers extended, hand waves side to side.',
    category: 'Greeting'
  },
  {
    name: 'Thank You',
    emoji: '🙏',
    gesture: 'Flat hand from chin',
    description: 'Flat hand moves from chin forward and down (upper half of frame).',
    category: 'Polite'
  },
  {
    name: 'Yes',
    emoji: '✅',
    gesture: 'Fist nod',
    description: 'Closed fist moves up and down.',
    category: 'Response'
  },
  {
    name: 'No',
    emoji: '❌',
    gesture: 'Two finger wave',
    description: 'Index and middle finger extended, wave side to side.',
    category: 'Response'
  },
  {
    name: 'Help',
    emoji: '🆘',
    gesture: 'Thumbs up lift',
    description: 'Fist with thumb up, lifts upward (ILY hand shape is also supported).',
    category: 'Emergency'
  },
  {
    name: 'Good',
    emoji: '👍',
    gesture: 'Thumbs up',
    description: 'Thumb up, other fingers curled.',
    category: 'Response'
  },
  {
    name: 'Bad',
    emoji: '👎',
    gesture: 'Thumbs down',
    description: 'Thumb down, other fingers curled.',
    category: 'Response'
  },
  {
    name: 'Water',
    emoji: '💧',
    gesture: 'W-shape tap',
    description: 'Index, middle, and ring fingers extended, tapping motion.',
    category: 'Need'
  },
  {
    name: 'Food',
    emoji: '🍽️',
    gesture: 'Pinch to mouth',
    description: 'All fingertips pinched together, pointing toward the mouth.',
    category: 'Need'
  },
  {
    name: 'Stop',
    emoji: '✋',
    gesture: 'Flat palm push',
    description: 'Open palm, pushes forward.',
    category: 'Control'
  },
  {
    name: 'Sign A',
    emoji: '🅰️',
    gesture: 'Closed fist, thumb on side',
    description: 'All four fingers curled into the palm, with the thumb resting along the side of the index finger.',
    category: 'Alphabet'
  },
  {
    name: 'Sign B',
    emoji: '🅱️',
    gesture: 'Flat hand, thumb folded',
    description: 'All four fingers extended straight up and close together, with the thumb folded across the palm.',
    category: 'Alphabet'
  },
  {
    name: 'Sign D',
    emoji: '🇩',
    gesture: 'Index pointing up, thumb touching other tips',
    description: 'Index finger pointing straight up, while middle, ring, and pinky fingers curl down to touch the thumb.',
    category: 'Alphabet'
  },
  {
    name: 'Sign F (OK)',
    emoji: '🇫',
    gesture: 'Index and thumb touching, others extended',
    description: 'The index finger and thumb touch tips to form a circle, while middle, ring, and pinky fingers are extended straight up.',
    category: 'Alphabet'
  },
  {
    name: 'Sign I',
    emoji: 'ℹ️',
    gesture: 'Pinky pointing up, others curled',
    description: 'Pinky finger extended straight up, with index, middle, ring fingers, and thumb curled into the palm.',
    category: 'Alphabet'
  },
  {
    name: 'Sign L',
    emoji: '🇱',
    gesture: 'Index and thumb extended',
    description: 'Index finger points straight up, and the thumb extends out horizontally at a 90-degree angle to form an "L".',
    category: 'Alphabet'
  },
  {
    name: 'Sign U',
    emoji: '🇺',
    gesture: 'Index and middle extended together',
    description: 'Index and middle fingers extended straight up and held closely together, while ring, pinky, and thumb are curled.',
    category: 'Alphabet'
  },
  {
    name: 'Sign Y',
    emoji: '🇾',
    gesture: 'Thumb and pinky extended',
    description: 'Thumb and pinky fingers fully extended outwards, while index, middle, and ring fingers are curled into the palm.',
    category: 'Alphabet'
  },
  {
    name: 'Welcome',
    emoji: '🤝',
    gesture: 'Open palm in lower half',
    description: 'All fingers extended straight out with palm facing upward, held in the lower half of the camera view.',
    category: 'Polite'
  },
  {
    name: 'Quiet (Shh)',
    emoji: '🤫',
    gesture: 'Index pointing up in center',
    description: 'Index finger pointing straight up, while other fingers are curled, held near the center of the frame.',
    category: 'Phrase'
  },
  {
    name: 'Peace',
    emoji: '✌️',
    gesture: 'Index and middle spread apart',
    description: 'Index and middle fingers extended straight up and spread apart in a "V" shape (Victory shape).',
    category: 'Phrase'
  }
];

export default function SignsLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Greeting', 'Response', 'Polite', 'Need', 'Emergency', 'Control', 'Alphabet', 'Phrase'];

  const filteredSigns = SIGNS_DATA.filter(sign => {
    const matchesSearch = sign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sign.gesture.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || sign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Gesture Library
          </h2>
          <p className="text-dark-400 text-sm mt-1">
            Browse and learn the 21 hand signs supported by the SignSpeak AI engine.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <input
            type="text"
            placeholder="Search gestures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-dark-800/60 border border-dark-700/50 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300"
          />
          <svg
            className="absolute left-3.5 top-3 w-4 h-4 text-dark-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-dark-800 pb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-md shadow-primary-500/5'
                : 'bg-dark-800/40 text-dark-400 border border-transparent hover:text-dark-200 hover:bg-dark-800/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Signs Grid */}
      {filteredSigns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSigns.map(sign => (
            <div
              key={sign.name}
              className="glass-card-dark p-6 flex flex-col justify-between hover:border-primary-500/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300" role="img" aria-label={sign.name}>
                    {sign.emoji}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-dark-900/60 border border-dark-800 text-[10px] font-bold tracking-wider text-dark-400 uppercase">
                    {sign.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors duration-300">
                  {sign.name}
                </h3>
                <p className="text-xs text-primary-400/90 font-medium mt-1 font-mono">
                  {sign.gesture}
                </p>
                <p className="text-sm text-dark-300 mt-3 leading-relaxed">
                  {sign.description}
                </p>
              </div>

              {/* Try Gesture Visual Indicator */}
              <div className="mt-6 pt-4 border-t border-dark-800/80 flex items-center justify-between text-xs text-dark-500 font-semibold group-hover:text-primary-400 transition-colors duration-300">
                <span>Hold hand in camera view</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card-dark">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-white mt-4">No Gestures Found</h3>
          <p className="text-dark-500 text-sm mt-1">Try resetting your search query or choosing another category.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="mt-4 btn-secondary text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
