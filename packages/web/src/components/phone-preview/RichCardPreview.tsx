import MediaImage from './MediaImage';
import CardSuggestionChip from './CardSuggestionChip';

interface RichCardProps {
  richCard: any;
  phone: string;
}

export default function RichCardPreview({ richCard, phone }: RichCardProps) {
  if (richCard.standaloneCard) {
    return <StandaloneCardPreview card={richCard.standaloneCard} phone={phone} />;
  }
  if (richCard.carouselCard) {
    return <CarouselPreview carousel={richCard.carouselCard} phone={phone} />;
  }
  return <div className="text-xs text-gray-400">[Unknown rich card]</div>;
}

function StandaloneCardPreview({ card, phone }: { card: any; phone: string }) {
  const { cardContent, cardOrientation } = card;
  const isHorizontal = cardOrientation === 'HORIZONTAL';

  return (
    <div className={`rounded-lg overflow-hidden bg-white border border-gray-200 ${isHorizontal ? 'flex' : ''}`}>
      {cardContent.media && (
        <div className={isHorizontal ? 'w-1/3 min-h-[80px]' : 'w-full'}>
          <MediaImage media={cardContent.media} className={isHorizontal ? 'h-full w-full object-cover' : 'h-32 w-full object-cover'} />
        </div>
      )}
      <div className="p-3 flex-1">
        {cardContent.title && (
          <div className="font-medium text-sm">{cardContent.title}</div>
        )}
        {cardContent.description && (
          <div className="text-xs text-gray-600 mt-1">{cardContent.description}</div>
        )}
        {cardContent.suggestions && cardContent.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {cardContent.suggestions.map((s: any, i: number) => (
              <CardSuggestionChip key={i} suggestion={s} phone={phone} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CarouselPreview({ carousel, phone }: { carousel: any; phone: string }) {
  const { cardContents, cardWidth } = carousel;
  const widthClass = cardWidth === 'SMALL' ? 'w-40' : 'w-56';

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {(cardContents ?? []).map((card: any, i: number) => (
        <div key={i} className={`${widthClass} shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200`}>
          {card.media && (
            <MediaImage media={card.media} className="h-24 w-full object-cover" />
          )}
          <div className="p-2">
            {card.title && <div className="font-medium text-xs">{card.title}</div>}
            {card.description && <div className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{card.description}</div>}
            {card.suggestions && card.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {card.suggestions.map((s: any, j: number) => (
                  <CardSuggestionChip key={j} suggestion={s} phone={phone} size="sm" />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
