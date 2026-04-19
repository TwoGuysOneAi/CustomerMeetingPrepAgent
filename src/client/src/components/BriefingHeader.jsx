import './BriefingHeader.css';

export default function BriefingHeader({ customerName, meetingContext, onReset, onExport, exporting }) {
  return (
    <header className="briefing-header">
      <div className="briefing-header__identity">
        <h1 className="briefing-header__name">{customerName}</h1>
        {meetingContext && <p className="briefing-header__sub">{meetingContext}</p>}
      </div>
      <div className="briefing-header__actions">
        <button className="hdr-btn" onClick={onExport} disabled={exporting}>{exporting ? 'Exporting…' : '⬇ Export'}</button>
        <button className="hdr-btn" onClick={onReset}>↩ New Briefing</button>
      </div>
    </header>
  );
}
