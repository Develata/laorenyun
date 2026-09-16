import test from 'node:test';
import assert from 'node:assert/strict';
import {validateConfig} from './config.mjs';
test('empty credentials permit cloud-independent local readiness',()=>assert.deepEqual(validateConfig({}),{profile:'laorenyun',modelConfigured:false,speechConfigured:false}));
test('partial cloud credentials fail without echoing secrets',()=>{const secret='private-test-value';assert.throws(()=>validateConfig({TENCENTCLOUD_SECRET_KEY:secret}),e=>!e.message.includes(secret));assert.throws(()=>validateConfig({LAORENYUN_LLM_API_KEY:secret}));});
test('invalid protocol, timing, endpoint and production fixtures fail',()=>{for(const e of [{LAORENYUN_LLM_PROTOCOL:'bad'},{TENCENT_ASR_TIMEOUT_MS:'NaN'},{TENCENT_TTS_TIMEOUT_MS:'999999'},{LAORENYUN_LLM_BASE_URL:'http://example.com/v1'},{LAORENYUN_LLM_BASE_URL:'https://user:secret@example.com/v1'},{LAORENYUN_SPEECH_FIXTURE:'true'},{LAORENYUN_PROBES:'true'}])assert.throws(()=>validateConfig(e));});
test('valid standard/mixed engines stay configurable',()=>{for(const engine of ['16k_zh','16k_zh_en'])assert.doesNotThrow(()=>validateConfig({TENCENT_ASR_ENGINE:engine}));});
