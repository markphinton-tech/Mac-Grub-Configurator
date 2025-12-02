import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScriptConfig, GeneratedScript } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    script: {
      type: Type.STRING,
      description: "The full bash script content that will be executed on the Mac.",
    },
    explanation: {
      type: Type.STRING,
      description: "Markdown formatted instructions and explanation of what the script does.",
    },
  },
  required: ["script", "explanation"],
};

export const generateRescueScript = async (config: ScriptConfig): Promise<GeneratedScript> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert Linux and macOS system administrator.
    Your task is to write a robust bash script that a user will run on a macOS machine to create a rescue USB drive.
    
    CONTEXT: The user is experiencing graphics/boot issues on an existing Linux installation (Ubuntu) on an old MacBook Pro. They have a Live USB for Ubuntu (Installer), but need a second USB (the rescue USB) to carry a script that fixes the INSTALLED system.
    
    GOAL: Create a script for macOS that:
    1. Formats a target USB stick (safe for bootable scripts).
    2. Writes a specific 'repair_boot.sh' script onto that USB.
    
    PART 1: The macOS Host Script
    - AUTO-ELEVATION: The script must run as root.
      - Check if running as root (EUID 0).
      - If NOT root: execute 'sudo "$0" "$@"' and exit.
      - This ensures that when the user double-clicks the .command file, it simply asks for their password and continues, rather than failing.
    - The script must take the TARGET_DISK default (e.g., ${config.diskIdentifier}) but verify it.
    - Run 'diskutil list external' to show the user what drives are available.
    - Prompt the user to confirm the target identifier (allow them to change it if they see it's wrong).
    - Auto-correct logic: If user enters 'disk4s1', strip it to 'disk4' for the format command, but warn them.
    - SAFETY CRITICAL: Use 'diskutil info' to verify the target disk.
      - Check if 'Device Location' contains 'External' OR 'Protocol' contains 'USB'.
      - IF IT LOOKS INTERNAL/FIXED:
        - Print a HUGE WARNING: "WARNING: Disk [DISK] appears to be an INTERNAL or FIXED disk."
        - Ask the user to type "force" to proceed.
        - If they type anything else, exit.
        - If "force", proceed.
    - Prompt the user for confirmation: "This will ERASE ALL DATA on the target disk. Type 'yes' to continue."
    - Format command: 'diskutil eraseDisk FAT32 RESCUE MBRFormat /dev/[TARGET]' (Ensure it uses MBR).
    - The mount point will be /Volumes/RESCUE.
    - Create the 'repair_boot.sh' file at /Volumes/RESCUE/repair_boot.sh.
    - Make 'repair_boot.sh' executable.
    - Run 'ls -l /Volumes/RESCUE' to visually prove the file exists.
    - Do NOT unmount immediately. Tell the user "Script created. Please Eject 'RESCUE' manually when ready."
    - CRITICAL: End the script with 'read -p "Press [Enter] to exit..."' so the window stays open.
    
    PART 2: The 'repair_boot.sh' content (to be written to the USB)
    This script is intended to be run from a Live Linux USB (e.g., Ubuntu Try Mode) on the faulty machine.
    - It must explicitly look for the EXISTING installation on the internal drive.
    - Detect partitions (lsblk) and ask user to input the Linux root partition (e.g., /dev/sda2).
    - Mount the EXISTING root partition to /mnt.
    - Bind mount /dev, /proc, /sys, /run to /mnt/...
    - Chroot into /mnt.
    - ERROR HANDLING: Wrap the chroot command. If 'chroot' fails (e.g. Input/output error), print a LOUD RED ERROR MESSAGE: "CRITICAL ERROR: Failed to enter system. Check if your Live USB is loose or if the internal drive is corrupted."
    - INSIDE CHROOT:
      - Backup /etc/default/grub to /etc/default/grub.bak.
      - Modify /etc/default/grub to fix old Mac graphics issues:
        - Ensure 'nomodeset' is present.
        - Ensure 'splash' is REMOVED.
        - Example replacement: sed -i 's/GRUB_CMDLINE_LINUX_DEFAULT=".*"/GRUB_CMDLINE_LINUX_DEFAULT="quiet nomodeset"/' /etc/default/grub
      - Run 'update-grub'.
      ${config.includeOptimizations ? `
      - PERFORMANCE OPTIMIZATIONS:
        - Modify /etc/sysctl.conf (append if not present) to set 'vm.swappiness=10'.
        - Set 'vm.vfs_cache_pressure=50'.
        - Echo "Applied performance optimizations: Swappiness reduced to 10."
      ` : ''}
    - Exit chroot.
    - Unmount everything.
    - Echo "Success. Reboot without the USBs."

    EXPLANATION OUTPUT:
    - Clearly explain this is a TWO USB process (Live USB + Rescue USB).
    - INSTRUCTION CHANGE: Tell the user to run the script using 'sudo bash repair_boot.sh' (NOT ./repair_boot.sh) because FAT32 USB drives often block executable permissions.
    - Include specific troubleshooting if the USB doesn't show up in Linux (e.g., "try 'sudo mount -L RESCUE /mnt/usb'").
    - Mention that "Input/output error" usually means the Live USB stick itself is failing.
    - Mention the performance tweaks if enabled.

    USER INPUTS:
    - Target USB Identifier: ${config.diskIdentifier}
    - Issue Description: ${config.issueDescription}
    - Distro: ${config.linuxDistro}
    - Include Optimizations: ${config.includeOptimizations}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate the rescue USB creation script for disk identifier: ${config.diskIdentifier}. Ensure the repair script handles Input/output errors gracefully.${config.includeOptimizations ? ' Include system speed optimizations.' : ''}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Clean up potential markdown code blocks which can confuse JSON.parse
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?\n/, "").replace(/```$/, "");
    }
    
    // Trim whitespace to ensure clean parsing
    text = text.trim();

    const json = JSON.parse(text);
    return {
      content: json.script,
      explanation: json.explanation
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate script. Please check your API key and try again.");
  }
};