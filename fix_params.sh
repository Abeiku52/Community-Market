#!/bin/bash
# Fix SQL parameter placeholders in listingService.ts

sed -i '' 's/LOWER(${paramCount++})/LOWER($'"'"'${paramCount}'"'"')/g' src/services/listingService.ts
sed -i '' 's/= ${paramCount++}/= $'"'"'${paramCount}'"'"'/g' src/services/listingService.ts  
sed -i '' 's/>= ${paramCount++}/>= $'"'"'${paramCount}'"'"'/g' src/services/listingService.ts
sed -i '' 's/<= ${paramCount++}/<= $'"'"'${paramCount}'"'"'/g' src/services/listingService.ts
sed -i '' 's/LIKE ${paramCount}/LIKE $'"'"'${paramCount}'"'"'/g' src/services/listingService.ts

# Now increment paramCount after each use
awk '
/userDomain/ && /query \+=/ { print; getline; print; print "      paramCount++;"; next }
/category/ && /query \+=/ { print; getline; print; print "      paramCount++;"; next }
/minPrice/ && /query \+=/ { print; getline; print; print "      paramCount++;"; next }
/maxPrice/ && /query \+=/ { print; getline; print; print "      paramCount++;"; next }
{ print }
' src/services/listingService.ts > src/services/listingService.ts.tmp && mv src/services/listingService.ts.tmp src/services/listingService.ts
