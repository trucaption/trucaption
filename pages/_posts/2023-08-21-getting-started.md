---
title: Getting Started
author: derek
date: 2023-08-21 08:55:00 -0400
categories: [Tutorial]
tags: [getting started]
pin: true
permalink: /getting-started/
---

## Creating and Editing Captions

Getting started with Trucaption is easy! Just download and run the application from the [Download](/download/) page on a computer connected to your audio source (microphone/sound board/etc.).

Once Trucaption starts, your browser will open to the editor screen where you can start, stop, and edit the captions. If you are using a browser that supports built-in speech recognition, you don't need to do any configuration -- just click "Connect", then "Start Captions".

Automatic captioning isn't perfect, and there will sometimes be errors in the generated text. In Trucaption, you can edit captions after they are generated to fix these errors. Just click the text you want to edit, make the desired changes, then press Enter or click elsewhere on the screen. The changes will be immediately sent to all viewers. If you want to cancel your changes, press Escape.

## Viewing Captions

If you click "Open Viewer" in the editor window, a dedicated viewing window will open. This is great for use on a large-screen display (e.g., using a projector or television connected to the computer running Trucaption).

The viewer can also be opened across the network -- just go to http://your.trucaption.computer.address/ on another computer. If you want to make captions available via the internet, you'll probably need to set up either port forwarding or a reverse proxy like Cloudflare Tunnels.

## Advanced Captioning

By default, Trucaption uses the built-in speech recognition provided by your web browser to generate captions. If you would like to use an advanced transcription service, Trucaption can also be connected to either Azure Speech Services or Speechly:

- [Azure Speech Services](/azure/)
- [Speechly](/speechly/)