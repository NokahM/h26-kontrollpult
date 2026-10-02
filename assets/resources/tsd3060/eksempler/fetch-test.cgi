#!/bin/sh

cat << EOF
Content-type:text/html;charset=utf-8

<tr><td> <hr>            </td><td> <hr>                       </tr>
<tr><td> REQUEST_URI     </td><td> $REQUEST_URI               </tr>
<tr><td> REQUEST_METHOD  </td><td> $REQUEST_METHOD            </tr>
<tr><td> QUERY_STRING    </td><td> $QUERY_STRING              </tr>
<tr><td> Kroppen         </td><td> $(head -c $CONTENT_LENGTH) </tr>
EOF
