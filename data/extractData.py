# from asyncio.windows_events import NULL
from encodings import utf_8
import json

with open("taipei-attractions.json") as result:
    data = json.load(result)

result_list = data["result"]["results"]

countEachGroup = 0
totalLength = 0
page = 1
nextPageList = []
DataList = []

for i in result_list:
    # adjustedInfo = i["info"]
    countEachGroup += 1
    totalLength +=1
    # Here is to split the whole string into accurate image items.
    image = i["file"].split('https://')
    image.pop(0)
    eachIdImage = []
    for g in image:
        if g[-3:] in ("jpg","png","JPG", "PNG"):
        # print(g[-3:])
            prefix = "https://"
            eachIdImage.append(prefix+g)
   
        
    if countEachGroup > 12:
        countEachGroup = 1
        nextPageList.append({"nextPage": page, "data": DataList})
        page +=1
        DataList = []
        DataList.append({"id": i["_id"], 
                         "name": i["stitle"], 
                         "category": i["CAT2"], 
                         "description": i["xbody"], 
                         "address": i["address"],
                         "transport": i["info"],
                         "mrt": i["MRT"],
                         "latitude": float(i["latitude"]),
                         "longitude": float(i["longitude"]),
                         "images":eachIdImage})
        
    else:
        DataList.append({"id": i["_id"], 
                         "name": i["stitle"], 
                         "category": i["CAT2"], 
                         "description": i["xbody"], 
                         "address": i["address"],
                         "transport": i["info"],
                         "mrt": i["MRT"],
                         "latitude": float(i["latitude"]),
                         "longitude": float(i["longitude"]),
                         "images":eachIdImage})
        if totalLength == len(result_list):
              nextPageList.append({"nextPage": None, "data": DataList})
        

finalResult = json.dumps(nextPageList, ensure_ascii=False)



# print(finalResult)
with open('new-taipei-attractions.json', mode='w', encoding='utf-8') as f:
    f.write(finalResult)
    
    
    
    
# Testing model below:
# print(len(result_list))
# for i in result_list:
#     countEachGroup += 1
#     totalLength +=1
#     print(f'totalLength; {totalLength}')
#     if countEachGroup > 12:
#         countEachGroup = 1
#         nextPageList.append({"nextPage": page, "data": DataList})
#         print(f"nextPageList: {nextPageList}")
#         page +=1
#         print(page)
#         DataList = []
#         DataList.append({"id": i["_id"]})
#         print(f'if: {DataList}')
#     else:
#          DataList.append({"id": i["_id"]})
#          print(f'else: {DataList}')
#          if totalLength == len(result_list):
#              nextPageList.append({"nextPage": page, "data": DataList})
             
#     # countEachGroup += 1
#     # totalLength +=1    
# print(len(nextPageList))
# print(nextPageList)

# Image testing model:
# totalImage = []
# for i in result_list:
#     image = i["file"].split('https://')
#     image.pop(0)
#     eachIdImage = []
#     for g in image:
#         prefix = "https://"
#         eachIdImage.append(prefix+g)
#     totalImage.append(eachIdImage)
#     # print(f'image: {image}')
#     # print("***************")
#     # print(f'each image: {eachIdImage}')
#     print("==============")
    
# print(totalImage)