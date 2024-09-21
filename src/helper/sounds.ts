export interface SoundData {
    file: string;
    volume: number;
}

export class SoundManager {
    private soundDir: string = 'sounds';
    private soundMap: Record<string, SoundData> = {};
    private soundBaseVol = 0.5;

    parseOptions(options: string) {
        this.soundDir = 'sounds';
        this.soundMap = {};

        const lines = options.split('\n');
        for (const line of lines) {
            if (line.trim().startsWith('SOUNDDIR')) {
                this.soundDir = line.split('=').pop()?.trim() ?? 'sounds';
            } else if (line.trim().startsWith('SOUNDVOL')) {
                const value = line.split('=').pop();
                const volume = parseFloat(value?.trim() ?? '');
                if (isNaN(volume)) {
                    console.error('Invalid sound volume:', value);
                    continue;
                }

                this.soundBaseVol = volume / 100;
            } else if (line.trim().startsWith('SOUND')) {
                const value = line.split('=').pop();
                const parts = Array.from(value?.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [])
                if (parts.length < 4)  {
                    console.error('Invalid sound line:', line);
                    continue;
                }

                const regex = parts[1].trim().replaceAll('"', '');
                if (regex === '') {
                    console.error('Invalid sound regex:', parts[1]);
                    continue;
                }

                const file = parts[2].trim().replaceAll('"', '');
                if (file === '') {
                    console.error('Invalid sound file:', parts[2]);
                    continue;
                }

                const volume = parseInt(parts[3].trim());
                if (isNaN(volume)) {
                    console.error('Invalid sound volume:', parts[3]);
                    continue;
                }

                this.soundMap[regex] = { file, volume };
            }
        }

        console.log('Sound options:', this.soundDir, this.soundMap);
    }

    playSoundForMessage(message: string) {
        for (const [regex, soundData] of Object.entries(this.soundMap)) {
            if (new RegExp(regex).test(message)) {
                this.playSound(soundData);
                break;
            }
        }
    }

    private playSound(sound: SoundData) {
        const audio = new Audio(`${this.soundDir}/${sound.file}`);
        audio.volume = (sound.volume / 100) * this.soundBaseVol;
        audio.play();
        console.log(`Playing sound: ${sound.file} at volume ${sound.volume} with base volume ${this.soundBaseVol}`);
    }
}
