import { ChoreoReveal } from '@/motion';

interface SectionHeadingProps {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: 'cyan' | 'violet' | 'lime' | 'amber';
  highlightWord?: string;
  id: string;
}

export function SectionHeading({
  number,
  eyebrow,
  title,
  description,
  tone = 'cyan',
  highlightWord,
  id,
}: SectionHeadingProps) {
  const renderTitle = () => {
    if (!highlightWord) return title;
    const idx = title.indexOf(highlightWord);
    if (idx === -1) return title;
    const before = title.slice(0, idx);
    const after = title.slice(idx + highlightWord.length);
    return (
      <>
        {before}
        <mark className="editorial-highlight">{highlightWord}</mark>
        {after}
      </>
    );
  };

  return (
    <header className={`section-heading section-heading--${tone}`}>
      <ChoreoReveal as="p" className="section-eyebrow" direction="left" distance={24}>
        <span>{number}</span> / {eyebrow}
      </ChoreoReveal>
      <div className="section-title-mask">
        <ChoreoReveal delay={0.05} direction="up" distance={28}>
          <h2 id={id}>{renderTitle()}</h2>
        </ChoreoReveal>
      </div>
      <ChoreoReveal delay={0.08} direction="draw-x">
        <span aria-hidden="true" className="section-rule" />
      </ChoreoReveal>
      {description ? (
        <ChoreoReveal
          as="p"
          className="section-description"
          delay={0.1}
          direction="up"
          distance={22}
        >
          {description}
        </ChoreoReveal>
      ) : null}
    </header>
  );
}
