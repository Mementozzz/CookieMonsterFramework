const bufferMap = new Map();
let audioCtx;
let source;

function playBuffer(buffer) {
  source = audioCtx.createBufferSource();
  source.buffer = buffer;
}

async function fetchOrRecoverAudio(url) {
  let bufferData;
  try {
    bufferData = bufferMap.get(url);
    if (!bufferData) {
      const response = await fetch(url);
      bufferData = await response.arrayBuffer();
      bufferMap.set(url, bufferData);
    }
    audioCtx.decodeAudioData(bufferData, playBuffer);
  } catch (err) {
    console.error(`Unable to fetch the audio file. Error: ${err.message}`);
  }
}

/**
 * This function plays a sound depending on config
 * @param	{string}	modName	    The name of the mod
 * @param	{variable}	url			A variable that gives the url for the sound (e.g., CM.Options.GCSoundURL)
 * @param	{string}	sndConfig	The setting in CM.Options that is checked before creating the sound
 * @param	{string}	volConfig	The setting in CM.Options that is checked to determine volume
 * @param	{bool}    forced		Whether the sound should play regardless of settings, used to test the sound
 */
export default function playCMSound(modName, url, sndConfig, volConfig, forced) {
  if (
    (Game.mods.cookieMonsterFramework.saveData[modName].settings[sndConfig] === 1 || forced) &&
    window.cookieMonsterFrameworkData.isInitializing === false
  ) {
    fetchOrRecoverAudio(url);
    const gainNode = audioCtx.createGain();

    if (
      Game.mods.cookieMonsterFramework.saveData[modName].settings.GeneralSound
    )
      gainNode.gain.value =
        (Game.mods.cookieMonsterFramework.saveData[modName].settings[volConfig] / 100) *
        (Game.volume / 100);
    else
      gainNode.gain.value =
        Game.mods.cookieMonsterFramework.saveData[modName].settings[volConfig] / 100;

    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    source.loop = true;
    source.start();
  }
}
