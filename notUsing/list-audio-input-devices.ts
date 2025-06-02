// src/utils/list-audio-input-devices.ts

const listAudioInputDevices = async (): Promise<MediaDeviceInfo[]> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.error("Media Devices API not supported.");
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputDevices = devices.filter(
      (device) => device.kind === "audioinput"
    );
    audioInputDevices.forEach((device) => {
      console.log(
        `Device: ${device.label || "Unnamed Device"}, ID: ${device.deviceId}`
      );
    });
    return audioInputDevices;
  } catch (error) {
    console.error("Error enumerating devices:", error);
    return [];
  }
};

export { listAudioInputDevices };
