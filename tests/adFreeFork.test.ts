import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from '@/i18n';
import { ProxyUrlField } from '@/features/config/components/fields/sharedFields';
import { CLAUDE_API_BASE_URL } from '@/features/providers/claudeApi';
import { ProviderCategoryList } from '@/features/providers/components/ProviderCategoryList';
import { PROVIDER_BRAND_ORDER } from '@/features/providers/descriptors';
import type { ProviderSnapshot } from '@/features/providers/types';
import { useProviderWorkbench } from '@/features/providers/useProviderWorkbench';
import { useConfigStore } from '@/stores/useConfigStore';
import type { Config, ProviderKeyConfig } from '@/types';
import { DEFAULT_VISUAL_VALUES } from '@/types/visualConfig';

const readSource = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const PROMOTION_PATTERN =
  /sponsor|affiliate|bestproxy|apimart|apikey\.fun|\bcode0\b|fenno.?ai|qiniu|lmu.?ai|infistar|[?&]aff=/i;

describe('ad-free fork', () => {
  test('keeps runtime sources, translations, and documentation free of promotions', () => {
    const paths = readdirSync(new URL('../src/', import.meta.url), { recursive: true })
      .filter((path) => /\.(tsx?|scss|json)$/.test(path) && path !== 'assets/logoInline.ts')
      .map((path) => `src/${path}`);
    const violations = [...paths, 'README.md', 'README_CN.md'].filter((path) =>
      PROMOTION_PATTERN.test(readSource(path))
    );

    expect(violations).toEqual([]);
  });

  test('does not ship unused sponsor modules or newly introduced advertising assets', () => {
    const paths = [
      'src/features/config/sponsors.ts',
      'src/features/providers/kimi.ts',
      'src/features/providers/sponsorDefinitions.ts',
      'src/assets/icons/bestproxy.png',
      'assets/apimart-en.png',
      'assets/apimart-zh.png',
    ];

    expect(paths.filter((path) => existsSync(new URL(`../${path}`, import.meta.url)))).toEqual([]);
  });

  test('renders ClaudeAPI alongside ordinary providers without a quick-access promotion', () => {
    const groups = PROVIDER_BRAND_ORDER.map((id) => ({ id, resources: [] }));
    const markup = renderToStaticMarkup(
      createElement(ProviderCategoryList, {
        groups,
        activeBrand: 'claudeApi',
        onSelect: () => {},
      })
    );

    expect(PROVIDER_BRAND_ORDER).toEqual([
      'gemini',
      'interactions',
      'codex',
      'xai',
      'claude',
      'vertex',
      'openaiCompatibility',
      'claudeApi',
    ]);
    expect(markup.match(/<aside\b/g)).toHaveLength(1);
    expect(markup.match(/<button\b/g)).toHaveLength(groups.length);
    expect(markup).toContain(i18n.t('providersPage.providerNames.claudeApi'));
    expect(markup).toContain('aria-current="page"');
  });

  test('keeps the proxy field usable without registration links', () => {
    const proxyUrl = 'socks5://127.0.0.1:1080';
    const markup = renderToStaticMarkup(
      createElement(ProxyUrlField, {
        values: { ...DEFAULT_VISUAL_VALUES, proxyUrl },
        disabled: false,
        onChange: () => {},
      })
    );

    expect(markup).toContain(`value="${proxyUrl}"`);
    expect(markup).toContain(i18n.t('config_management.visual.sections.network.proxy_url'));
    expect(markup).not.toMatch(/<a\b/);
  });

  test('keeps existing endpoint configs accessible through their protocol groups', () => {
    const providerConfigs: ProviderKeyConfig[] = [
      'https://api.apikey.fun/v1',
      'https://code0.ai/v1',
      'https://api.fenno.ai/v1',
      'https://api.qnaigc.com/v1',
      'https://api.lmuai.com/v1',
      'https://api.moonshot.cn/v1',
      'https://api.moonshot.ai/v1',
      'https://api.moonshot.cn/anthropic',
      'https://api.moonshot.ai/anthropic',
    ].map((baseUrl, index) => ({ apiKey: `fixture-key-${index}`, baseUrl }));
    const claudeApiConfig: ProviderKeyConfig = {
      apiKey: 'fixture-claude-api-key',
      baseUrl: CLAUDE_API_BASE_URL,
      fingerprintProfile: 'claude-code-cli',
    };
    const openaiConfigs = providerConfigs.map((config, index) => ({
      name: `fixture-provider-${index}`,
      baseUrl: config.baseUrl!,
      apiKeyEntries: [{ apiKey: config.apiKey }],
    }));
    const config: Config = {
      geminiApiKeys: providerConfigs,
      codexApiKeys: providerConfigs,
      claudeApiKeys: [...providerConfigs, claudeApiConfig],
      openaiCompatibility: openaiConfigs,
    };
    const initialState = useConfigStore.getInitialState();
    const originalConfig = initialState.config;
    const snapshots: ProviderSnapshot[] = [];

    function Harness() {
      const { snapshot } = useProviderWorkbench();
      if (snapshot) snapshots.push(snapshot);
      return null;
    }

    try {
      initialState.config = config;
      renderToStaticMarkup(createElement(Harness));
    } finally {
      initialState.config = originalConfig;
    }

    expect(snapshots).toHaveLength(1);
    const groups = new Map(snapshots[0].groups.map((group) => [group.id, group.resources]));
    for (const brand of ['gemini', 'codex', 'claude'] as const) {
      expect(groups.get(brand)?.map((resource) => resource.raw)).toEqual(providerConfigs);
      expect(groups.get(brand)?.map((resource) => resource.selector.index)).toEqual(
        providerConfigs.map((_, index) => index)
      );
    }
    expect(groups.get('openaiCompatibility')?.map((resource) => resource.raw)).toEqual(
      openaiConfigs
    );
    expect(groups.get('claudeApi')?.map((resource) => resource.raw)).toEqual([claudeApiConfig]);
    expect(groups.get('claudeApi')?.[0].flags.claudeCodeCliProfile).toBe(true);
  });

  test('preserves normal Kimi OAuth and removes the sponsor-only quick-start route', () => {
    expect(readSource('src/pages/OAuthPage.tsx')).toMatch(/kind: 'builtin',\s+id: 'kimi'/);
    expect(readSource('src/router/MainRoutes.tsx')).not.toContain('/quick-start');
  });
});
