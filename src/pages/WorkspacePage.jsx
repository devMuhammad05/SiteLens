import { useEffect, useState } from 'react';
import InspectionView from '../views/InspectionView.jsx';
import DiaryView from '../views/DiaryView.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Brand, WORKFLOWS } from '../components/Brand.jsx';
import { Button, Icon, cx } from '../components/ui.jsx';
import AiKeyPanel, { AiKeyButton, AiKeyNotice } from '../components/AiKeyPanel.jsx';
import { useInstallPrompt, useOnline } from '../lib/pwa.js';

const fromHash = () => (WORKFLOWS.some((w) => `#${w.id}` === window.location.hash) ? window.location.hash.slice(1) : 'inspect');

export default function WorkspacePage({ active = true }) {
  const [workflow, setWorkflow] = useState(fromHash);
  const online = useOnline();
  const { canInstall, install } = useInstallPrompt();
  const [keyPanelOpen, setKeyPanelOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setWorkflow(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!active) return;
    document.title = `${WORKFLOWS.find((w) => w.id === workflow).label} · SiteLens`;
    return () => {
      document.title = 'SiteLens';
    };
  }, [workflow, active]);

  const choose = (id) => {
    history.replaceState(null, '', `/app#${id}`);
    setWorkflow(id);
  };

  const current = WORKFLOWS.find((w) => w.id === workflow);

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 lg:px-8">
          <Brand />
          <ToolSwitcher current={workflow} onChange={choose} className="max-md:hidden" />
          <div className="flex items-center gap-2">
            <AiKeyButton onClick={() => setKeyPanelOpen(true)} />
            {canInstall && (
              <Button size="sm" variant="dark" icon="download" className="h-10" onClick={install}>
                Install app
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
        <div className="border-t border-line px-5 py-2 md:hidden">
          <ToolSwitcher current={workflow} onChange={choose} className="w-full" />
        </div>
      </header>

      {!online && (
        <div className="no-print border-b border-amber/40 bg-amber-soft" role="status">
          <p className="mx-auto max-w-[1280px] px-5 py-2.5 text-[13.5px] text-ink lg:px-8">
            <strong>You're offline.</strong> You can keep writing notes and open past reports. Checking photos and creating reports
            need a connection.
          </p>
        </div>
      )}

      <div className="mx-auto max-w-[1280px] px-5 pt-10 pb-20 lg:px-8 print:max-w-none print:p-0">
        <div className="no-print mb-8">
          <h1 className="font-display text-[36px] leading-tight font-semibold tracking-tight max-sm:text-[28px]">{current.title}</h1>
          <p className="mt-1.5 max-w-[64ch] text-[15px] text-muted">{current.blurb}</p>
        </div>

        <AiKeyNotice onAdd={() => setKeyPanelOpen(true)} />

        {/* Both stay mounted so switching tools doesn't discard work in progress. */}
        <div hidden={workflow !== 'inspect'}>
          <InspectionView />
        </div>
        <div hidden={workflow !== 'diary'}>
          <DiaryView />
        </div>
      </div>

      <AiKeyPanel open={keyPanelOpen} onClose={() => setKeyPanelOpen(false)} />
    </>
  );
}

function ToolSwitcher({ current, onChange, className }) {
  return (
    <div role="tablist" aria-label="Choose a tool" className={cx('inline-flex rounded-md border border-line bg-paper p-1', className)}>
      {WORKFLOWS.map((w) => {
        const active = current === w.id;
        return (
          <button
            key={w.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(w.id)}
            className={cx(
              'inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-[5px] px-3.5 text-[13.5px] transition-colors max-md:flex-1',
              active ? 'bg-heading font-medium text-paper' : 'text-muted hover:text-heading',
            )}
          >
            <Icon name={w.icon} className="size-4" />
            <span className="sm:hidden">{w.short}</span>
            <span className="max-sm:hidden">{w.label}</span>
          </button>
        );
      })}
    </div>
  );
}
