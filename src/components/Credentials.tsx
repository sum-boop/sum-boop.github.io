import { Award, GraduationCap } from 'lucide-react';
import { certifications, educationRecords } from '@/data/certifications';
import { SectionHeading } from './SectionHeading';

export function Credentials() {
  return (
    <section
      aria-labelledby="credentials-title"
      className="content-section-5lab credentials-section-5lab"
      id="certifications"
    >
      <div className="section-inner">
        <SectionHeading
          eyebrow="Certifications & Training"
          highlightWord="credentials."
          id="credentials-title"
          number="06"
          title="Verified credentials."
          tone="amber"
        />

        <div className="credentials-layout-5lab">
          {/* Education */}
          {educationRecords.map((record, index) => (
            <article
              className="credential-card-5lab credential-card-5lab--featured"
              key={record.title}
            >
              <div className="credential-card-header-5lab">
                <span className="credential-mono-tag">0{index} / EDUCATION</span>
                <GraduationCap aria-hidden="true" size={20} />
              </div>
              <h3 className="credential-card-title-5lab">{record.title}</h3>
              <p className="credential-card-desc-5lab">{record.detail}</p>
            </article>
          ))}

          {/* Certifications Grid */}
          <div className="certifications-grid-5lab">
            {certifications.map((certification, index) => (
              <article className="credential-card-5lab" key={certification.title}>
                <div className="credential-card-header-5lab">
                  <span className="credential-mono-tag">0{index + 1} / CERTIFIED</span>
                  <Award aria-hidden="true" size={18} />
                </div>
                <h3 className="credential-card-title-5lab">{certification.title}</h3>
                <p className="credential-card-desc-5lab">{certification.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
