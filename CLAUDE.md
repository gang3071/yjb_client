# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Cocos Creator 3.8.4** game project built with TypeScript. The project targets both web and native platforms (Android) with a design resolution of 1080x1920 (portrait orientation).

**Note**: TypeScript strict mode is disabled (`"strict": false` in tsconfig.json).

## Core Architecture

### Manager System (Singleton Pattern)

The project uses several singleton managers located in `assets/scripts/base/core/`:

- **SceneMgr**: Scene loading and transitions with automatic resource cleanup
  - Manages scene-specific resource loaders (`ResLoader`)
  - Scene paths follow the pattern: `"lobby#hallScene"`, `"login#loginScene"`
  - Auto-cleans resources on scene transitions (except on native platforms)

- **ServiceMgr**: Lazy-initialized service registry
  - Services are created on first access via `getService<T>(name, cls)`
  - All services must implement `start()` and `stop()` methods

- **UIMgr**: UI view lifecycle and layer management
  - Not directly visible in explored files but referenced throughout

- **MessageMgr**: Global event bus
  - Use `Message.on(event, callback, thisObj)` for global events
  - `MessageEventData` helper for batch registration/removal

- **ResLoader**: Resource loading with reference counting
  - Each view/scene has its own ResLoader instance
  - Resources are automatically released when views are destroyed

- **StoreMgr**: Application state management

### Base Classes

**BaseView** (`assets/scripts/base/frame/BaseView.ts`):
- Extends `cc.Component`
- Provides event handling, resource loading, and lifecycle management
- All scene and UI views should extend this class
- Includes `m_resLoader` for automatic resource cleanup on destroy
- Event system: `on()`, `once()`, `clearEvents()`

**BaseUI** (`assets/scripts/base/frame/BaseUI.ts`):
- Similar to BaseView but for UI components
- Auto-pauses event listeners when disabled, resumes when enabled

**BaseScene** (`assets/scripts/base/frame/BaseScene.ts`):
- Extends BaseView
- Use for scene root components

**BaseService** (`assets/scripts/base/frame/BaseService.ts`):
- Base class for services managed by ServiceMgr

### Network Architecture

Located in `assets/scripts/NetMgr/`:

- **pushSocket.ts**: WebSocket-based real-time communication using pusher protocol
  - Supports public and private channels
  - Handles connection state and reconnection

- **HttpRequest.ts**: HTTP API requests

**NetworkConfig.ts** defines server endpoints for different environments:
- Separate server lists for web (`SERVER_WEB_LIST`) and native (`SERVER_NATIVE_LIST`) platforms
- WebSocket URLs differ between platforms (native uses `ws://` only, web can use secure connections)
- Connection parameters:
  - `CONNECT_TIMEOUT`: 10 seconds
  - `HEART_GAP`: 30 seconds (heartbeat interval)
  - `HEART_TIMEOUT`: 50 seconds

### Environment Configuration

**Env.ts** defines four environments:
- `ENV.DEBUG`
- `ENV.INNER_TEST`
- `ENV.OUT_TEST`
- `ENV.RELEASE` (default)

Use `setCurEnv(env)` to change and `getCurEnv()` to read the current environment.

### Module Structure

Modules are in `assets/scripts/modules/`:

- **Login**: Authentication, password reset, registration
- **Lobby**: Main game lobby, user info, activities, rankings, money management
- **Game**: Game screens and gameplay logic
- **common**: Shared utilities (HotUpdate, sorting groups)

Each module follows the pattern:
1. Extends BaseView or BaseUI
2. Uses `@ccclass` and `@property` decorators for Cocos Creator binding
3. Registers for events in `start()` or `onLoad()`
4. Cleans up in `onDisable()` or `onDestroy()`

### Localization

- **LocalizadManager** (note the typo in the original code): Manages multi-language support
- **LabelConfig**: Translation key-value mappings
- Usage: `LabelConfig["key"][LocalizadManager.getInstance().getLanauge()-1]`

### Common Components

Located in `assets/scripts/common/`:

- **super-list/**: Advanced scrolling list components with recycling
  - `super-scrollview.ts`, `super-layout.ts`
  - Item classes extend `baseItem.ts`
  - Supports vertical, horizontal, page, and auto-center modes

- **scroll/**: Simple list components (`List.ts`, `ListItem.ts`)

- **AudioPlay.ts**: Audio management

- **adapt/**: Screen adaptation utilities (`BackgroundAdapter.ts`)

## Development Workflow

Since this is a Cocos Creator project, development is typically done through the Cocos Creator Editor, not via command-line build tools.

### Opening the Project

Open this directory in **Cocos Creator 3.8.4** (the exact version specified in package.json).

### Project Structure

- `assets/`: Game assets (scenes, scripts, resources)
- `assets/resources/`: Runtime-loadable resources
- `assets/scripts/`: TypeScript source code
- `build-templates/`: Custom build templates for platforms
- `library/`: Compiled asset cache (auto-generated)
- `local/`: Local settings (git-ignored)
- `native/`: Native platform build configurations
- `settings/`: Project settings
- `temp/`: Temporary build files (auto-generated)

### Important Patterns

1. **Resource Loading**: Always use ResLoader for loading resources to ensure proper cleanup
   ```typescript
   this.m_resLoader.loadSpriteFrame(path, (err, frame) => {
       // use frame
   });
   ```

2. **Event Handling**: Register events via BaseView/BaseUI methods
   ```typescript
   this.on(dispatcher, event, "handlerMethodName");
   this.once(dispatcher, event, "handlerMethodName");
   ```

3. **Scene Transitions**: Use SceneMgr
   ```typescript
   SceneMgr.getInstance().loadScene(scenePath, onProgress, onDone);
   ```

4. **Global Events**: Use Message for cross-module communication
   ```typescript
   Message.on("EventName", this.handler, this);
   Message.dispatchEvent("EventName", data);
   ```

5. **UI Management**: Open views via UIMgr (referenced but implementation not shown)
   ```typescript
   UIMgr.getInstance().openView(viewPath, data);
   ```

## Common Issues

- **Platform Differences**: Always check `cc.sys.isNative` when code needs to behave differently on web vs native platforms
- **Resource Leaks**: Ensure views properly call `clearEvents()` and release resources in `onDestroy()`
- **Environment-Specific URLs**: Server URLs are different for DEBUG, INNER_TEST, OUT_TEST, and RELEASE - check NetworkConfig.ts
- **Localization Typo**: The LocalizadManager class name has a typo (should be LocalizedManager) - maintain consistency with existing code

## Dependencies

From package.json:
- `crypto-es`: ^2.1.0 (cryptographic functions)
- `qrcode-generator`: ^1.4.4 (QR code generation)
- `tcplayer`: ^0.0.30 (video player)
- `tcplayer.js`: ^5.3.2 (video player)
