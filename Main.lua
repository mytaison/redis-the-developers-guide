print ("Hello, World!")
a = 5 + 9
print(a)


if(a > 10) then
  print('a is bigger than ' .. a)
end

if(a ~= 10) then 
  print('a is not equal to 10.')
end

if(0) then
  print('0 is truthy')
end

if false or not true then
  print ('It will not be printed.')
else
  print(true)
end

-- there is no null or undefined there
b = nil
if(b) then
  print("It will not be printed")
end

-- OBJECTS === Tables / Associative Arrays
arr = {"apple", "banana", "orange"}
print(arr)
-- index starts from 1
print(arr[1])
-- number of elements
print(#arr)
-- adding new element
table.insert(arr,"lemon")
print(arr[4])
-- iterating through all elements
for i, v in ipairs(arr) do
  print(i, v)
end
-- table like Associative array
local table1 = {
  name = "Nishat",
  age = 30
}
print(table1['name'], table1['age'])


-- FOR LOOP
print("For Loop")
for i= 5, 10 do
  print(i)
end

