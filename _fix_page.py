data = open('pages.json', 'rb').read()
marker = b'\"path\": \"wallet/score\"'
new_page = b'        {
          \"path\": \"wallet/balance\",
          \"style\": {
            \"navigationBarTitleText\": "\xe9\x92\xb1\xe5\x8c\x85\xe5\x85\x85\xe5\x80\xbc"
          },
          \"meta\": {
            \"auth\": true,
            \"title\": "\xe9\x92\xb1\xe5\x8c\x85\xe5\x85\x85\xe5\x80\xbc",
            \"group\": "\xe7\x94\xa8\xe6\x88\xb7\xe4\xb8\xad\xe5\xbf\x83"
          }
        },
'
data = data.replace(marker, new_page + marker)
open('pages.json', 'wb').write(data)
print('done')