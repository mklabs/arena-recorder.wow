local f = CreateFrame("Frame")
local screenshotDelay = 2

local function TakeScreenshot(isInArena)
  local msg = isInArena
      and "|cFF00FF00[ArenaRecorder]|r Arena start detected - taking screenshot."
      or "|cFFFF0000[ArenaRecorder]|r Arena end detected - taking screenshot."

  print(msg)
  Screenshot()
end

local ArenaRecorder_LastInstanceType = ""

-- Event: PLAYER_ENTERING_WORLD
f:RegisterEvent("PLAYER_ENTERING_WORLD")
f:SetScript("OnEvent", function(self, event)
  -- Store last known instance type to detect transitions

  C_Timer.After(screenshotDelay, function()
    if event == "PLAYER_ENTERING_WORLD" then
      local isInstance, instanceType = IsInInstance()
      print("|cFF00FF00[ArenaRecorder]|r instanceType: " .. instanceType)
      print("|cFF00FF00[ArenaRecorder]|r ArenaRecorder_LastInstanceType: " .. ArenaRecorder_LastInstanceType)
      if isInstance and instanceType == "arena" then
        TakeScreenshot(true)
      elseif ArenaRecorder_LastInstanceType == "arena" and instanceType ~= "arena" then
        TakeScreenshot(false)
      end

      ArenaRecorder_LastInstanceType = instanceType
    end
  end)
end)

-- ==========================================================
-- Slash Commands for manual testing
-- Usage:
--   /arenarecorder start
--   /arenarecorder stop
-- ==========================================================

SLASH_ARENARECORDER1 = "/arenarecorder"
SlashCmdList["ARENARECORDER"] = function(msg)
  msg = string.lower(msg or "")
  if msg == "start" then
    print("|cFF00FF00[ArenaRecorder]|r Manual trigger: Simulating arena start.")
    HandleArenaStateChange(true)
  elseif msg == "stop" then
    print("|cFFFF0000[ArenaRecorder]|r Manual trigger: Simulating arena end.")
    HandleArenaStateChange(false)
  else
    print("|cFFAAAAFF[ArenaRecorder Commands]|r")
    print("/arenarecorder start  - Simulate entering arena (takes screenshot)")
    print("/arenarecorder stop   - Simulate leaving arena (takes screenshot)")
  end
end
