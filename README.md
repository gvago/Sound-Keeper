# Web Sound Keeper

A web-based utility to prevent audio devices from sleeping by playing a configurable, continuous, and often inaudible sound stream. This provides a cross-platform alternative to desktop applications with similar functionality, solving standby issues for speakers like the T20, ADAM T10S, and many others.

## The Problem

Many modern powered speakers and audio interfaces have an energy-saving feature that puts them into a low-power standby mode after a period of silence. While eco-friendly, this can be frustrating as it often causes a delay or a "click" when audio starts playing again, and sometimes the beginning of a sound can be cut off.

## The Solution

Web Sound Keeper solves this by generating a constant, low-level audio stream. This signal is typically configured to be inaudible (either by using a very low or very high frequency, or minimal amplitude) but is sufficient to trick the audio device's circuitry into thinking audio is always playing, thus preventing it from entering standby mode.

## Features

- **Multiple Stream Types:** Choose from Sine Wave, White/Pink/Brown Noise, and other specialized streams.
- **Fully Configurable:** Adjust frequency, amplitude, and periodic playback settings to find the perfect inaudible signal for your setup.
- **Periodic Playback:** Set the sound to play in short bursts (e.g., 0.5 seconds every 9 minutes) instead of continuously.
- **Device Selection:** Direct the audio to a specific output device connected to your system.
- **Presets:** Quickly apply pre-configured settings for common use cases (e.g., an ultrasonic pulse).
- **No Installation Needed:** Runs entirely in your web browser.
- **Works Offline:** Can be saved and run locally without an internet connection.

## How to Run Offline / Locally

You can save this application to your computer and run it anytime, even without an internet connection. Due to browser security policies, you need to serve the files from a simple local web server.

1.  **Save the App:** In your browser, press `Ctrl+S` or `Cmd+S` to save the web page. Choose the "Web Page, Complete" format. This will download an `.html` file and a folder containing its assets.
2.  **Serve the Files:** Open a terminal or command prompt, navigate to the directory where you saved the files, and run one of the following commands:
    -   **If you have Python 3:**
        ```sh
        python -m http.server
        ```
    -   **If you have Node.js and npx:**
        ```sh
        npx serve
        ```
    -   Alternatively, use a tool like the "Live Server" extension in Visual Studio Code.
3.  **Access the App:** Your terminal will show a local URL. Open your web browser and navigate to that address (e.g., `http://localhost:8000`).

## Technical Details

This application is built using:

- **React:** For the user interface and component-based architecture.
- **Tailwind CSS:** For styling.
- **Web Audio API:** Specifically, it uses an `AudioWorkletProcessor` to generate all audio in a separate thread, ensuring high performance and preventing the UI from freezing, even with complex audio processing.

This approach provides a robust and efficient way to generate the required audio signals directly in the browser.
