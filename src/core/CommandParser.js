export class CommandParser {
  constructor() {
    this.commands = {
      navigation: [
        {
          pattern: /(?:zoom|go)\s+(?:to|in|out)\s+(.+)/i,
          handler: (matches) => ({
            action: 'zoomTo',
            params: { location: matches[1] },
          }),
        },
        {
          pattern: /(?:pan|move)\s+(?:to|towards)\s+(.+)/i,
          handler: (matches) => ({
            action: 'panTo',
            params: { location: matches[1] },
          }),
        },
      ],
      layerControl: [
        {
          pattern: /(?:show|hide)\s+(.+)\s+layer/i,
          handler: (matches) => ({
            action: 'toggleLayer',
            params: {
              layerName: matches[1],
              visible: matches[0].startsWith('show'),
            },
          }),
        },
      ],
      markerControl: [
        {
          pattern: /(?:add|place)\s+marker\s+(?:at|on)\s+(.+)/i,
          handler: (matches) => ({
            action: 'addMarker',
            params: { location: matches[1] },
          }),
        },
      ],
    };
  }

  parseCommand(command) {
    for (const category of Object.values(this.commands)) {
      for (const { pattern, handler } of category) {
        const matches = command.match(pattern);
        if (matches) {
          return handler(matches);
        }
      }
    }
    throw new Error(`Unrecognized command: ${command}`);
  }

  static preprocessCommand(command) {
    return command
      .toLowerCase()
      .replace(/\b(?:please|can you|would you)\b/gi, '') // Remove polite phrases
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }
}