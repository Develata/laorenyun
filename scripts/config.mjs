/** Validate configuration without inspecting/logging credential values. Empty cloud config is health-only. */
export function validateConfig(e) {
  const profile = e.LAORENYUN_PROFILE || 'laorenyun';
  if (!['laorenyun','laorenyun-dev'].includes(profile)) throw Error('PROFILE_CONFIG: invalid profile');
  for (const flag of ['LAORENYUN_PROBES','LAORENYUN_SPEECH_FIXTURE']) {
    if (e[flag] && !['true','false'].includes(e[flag])) throw Error('PROFILE_CONFIG: invalid boolean');
    if (e[flag] === 'true' && profile !== 'laorenyun-dev') throw Error('PROFILE_CONFIG: fixtures require developer profile');
  }
  if (e.LAORENYUN_SPEECH_FIXTURE === 'true' && e.LAORENYUN_PROBES !== 'true') throw Error('PROFILE_CONFIG: speech fixture requires probes');
  if (!['openai-responses','openai-completions','anthropic-messages'].includes(e.LAORENYUN_LLM_PROTOCOL || 'openai-responses')) throw Error('MODEL_CONFIG: unsupported protocol');
  if (!!e.LAORENYUN_LLM_MODEL !== !!e.LAORENYUN_LLM_API_KEY) throw Error('MODEL_CONFIG: supply both model and API key, or neither for local health-only startup');
  if (e.LAORENYUN_LLM_BASE_URL) {
    const u = new URL(e.LAORENYUN_LLM_BASE_URL);
    if (u.username || u.password || u.search || u.hash || (u.protocol !== 'https:' && !(u.protocol === 'http:' && ['localhost','127.0.0.1'].includes(u.hostname)))) throw Error('MODEL_CONFIG: use HTTPS API root without credentials/query');
  }
  const credentials=['TENCENTCLOUD_APP_ID','TENCENTCLOUD_SECRET_ID','TENCENTCLOUD_SECRET_KEY'].filter(k=>!!e[k]);
  if (credentials.length && credentials.length !== 3) throw Error('SPEECH_CONFIG: supply all three Tencent credential fields');
  if(e.TENCENTCLOUD_APP_ID && !/^\d{5,20}$/.test(e.TENCENTCLOUD_APP_ID)) throw Error('SPEECH_CONFIG: invalid AppID format');
  for (const [k,min,max,integer] of [['TENCENT_ASR_TIMEOUT_MS',1000,120000,true],['TENCENT_TTS_TIMEOUT_MS',1000,120000,true],['TENCENT_TTS_SPEED',-2,6,false],['TENCENT_TTS_VOLUME',-10,10,false],['TENCENT_TTS_VOICE',1,100000000,true],['LAORENYUN_PORT',1,65535,true]]) {
    if(e[k] === undefined || e[k] === '') continue;
    const n=Number(e[k]);if(!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n))) throw Error(`CONFIGURATION: invalid ${k}`);
  }
  if(e.TENCENT_ASR_ENGINE && !/^16k_[a-zA-Z_-]{2,24}$/.test(e.TENCENT_ASR_ENGINE)) throw Error('SPEECH_CONFIG: invalid engine');
  return {profile,modelConfigured:!!e.LAORENYUN_LLM_MODEL,speechConfigured:credentials.length===3};
}
