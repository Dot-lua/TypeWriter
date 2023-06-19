print("Hello World!")	
print(TypeWriter.ResourceManager:GetRaw("TypeWriterTest:/test.txt"))

local Sleep = Import("Sleep")

print(Await(Sleep(5000)))