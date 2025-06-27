import os
import shutil
import json
import schedule
import time
from tkinter import Tk, filedialog, simpledialog, messagebox

#   global variable
UNDO_LOG = "undo_log.json"



#   logs file moves to enablk undo later
def log_move(source, destination):
    if not os.path.exists(UNDO_LOG):
        with open(UNDO_LOG, "w") as f:
            json.dump([], f)
    
    with open(UNDO_LOG, "r+") as f:
        moves = json.load(f)
        moves.append({"source": source, "destination": destination})
        f.seek(0)
        json.dump(moves, f, indent=4)


#   MAIN FUNCTION FOR ORGANISING
def organise_files(folder_path, custom_rules=None):

    categories = {
        "Documents": [".pdf", ".docx", ".txt", ".xlsx", ".pptx"],
        "Images": [".jpg", ".png", ".gif", ".svg"],
        "Videos": [".mp4", ".mov", ".avi"],
        "Audio": [".mp3", ".wav", ".flac"],
        "Archives": [".zip", ".rar", ".7z"],
        "Others": []  # for uncategorised files
    }

#   merge custom rules if provided
    if custom_rules:
        for ext, folder in custom_rules.items():
            categories[folder] = categories.get(folder, []) + [ext.lower()]

#   process files
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        
        if os.path.isfile(file_path):
            file_ext = os.path.splitext(filename)[1].lower()
            moved = False

            for folder, extensions in categories.items():
                if file_ext in extensions:
                    dest_folder = os.path.join(folder_path, folder)
                    os.makedirs(dest_folder, exist_ok=True)
                    
#   duplicate filenames handle thiing
                    dest_path = os.path.join(dest_folder, filename)
                    if os.path.exists(dest_path):
                        base, ext = os.path.splitext(filename)
                        i = 1
                        while os.path.exists(dest_path):
                            dest_path = os.path.join(dest_folder, f"{base}({i}){ext}")
                            i += 1
                    
                    shutil.move(file_path, dest_path)
                    log_move(file_path, dest_path)  #   log the move
                    print(f"Moved '{filename}' to {folder}/")
                    moved = True
                    break

            if not moved:
                dest_folder = os.path.join(folder_path, "Others")
                os.makedirs(dest_folder, exist_ok=True)
                shutil.move(file_path, os.path.join(dest_folder, filename))
                log_move(file_path, os.path.join(dest_folder, filename))
                print(f"Moved '{filename}' to Others/")

#   UNDO FILE MOVES
def undo_last_move():
    if not os.path.exists(UNDO_LOG):
        print("No moves to undo")
        return
    
    with open(UNDO_LOG, "r") as f:
        moves = json.load(f)
    
    if not moves:
        print("No moves to undo")
        return
    
    for move in reversed(moves):
        try:
            shutil.move(move["destination"], move["source"])
            print(f"Moved back: {os.path.basename(move['source'])}")
        except FileNotFoundError:
            print(f"Couldn't find {move['destination']} (already undone?)")
    
#   clears the log
    with open(UNDO_LOG, "w") as f:
        json.dump([], f)


#   SCHEDULED CLEANING
def scheduled_clean(folder_path, interval_minutes=10080):
#   run cleaner weekly by default (10080 minutes = 1 week) -- can be adjusted based on user needs
    schedule.every(interval_minutes).minutes.do(organise_files, folder_path)
    print(f"Scheduled: Cleaning '{folder_path}' every {interval_minutes} minutes.")
    
    while True:
        schedule.run_pending()
        time.sleep(1.5)


#   GUI / GRAPHIC USER INTERFACE
def gui_mode():

    root = Tk() #   create GUI for user interaction
    root.withdraw() #   hide main window

#   asks user to select folder
    folder_path = filedialog.askdirectory(title="Select Folder to Clean")
    if not folder_path:
        return

#   custom file type rules
    custom_rules = {}
    if messagebox.askyesno("Custom Rules", "Add custom file categories?"):
        while True:
            ext = simpledialog.askstring("Custom Rule", "File extension (e.g., '.py'):")
            if not ext:
                break
            folder = simpledialog.askstring("Custom Rule", f"Folder for '{ext}' files:")
            custom_rules[ext.lower()] = folder

#   ask about scheduling
    if messagebox.askyesno("Schedule", "Run automatically every day?"):
        organise_files(folder_path, custom_rules)
        scheduled_clean(folder_path)
    else:
        organise_files(folder_path, custom_rules)
        if messagebox.askyesno("Undo", "Undo the last file organisation?"):
            undo_last_move()
        messagebox.showinfo("Done", "Operation completed!")

        
#   main Program
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:

#   run command-line
        if sys.argv[1].lower() == "undo":
            undo_last_move()
        else:
            organise_files(sys.argv[1])
    else:
        #   GUI mode
        gui_mode()
