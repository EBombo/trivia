export const snapshotToArray = (snapshot) => {
  const returnArray = [];
  snapshot.forEach((childSnapshot) => returnArray.push(childSnapshot.data()));
  return returnArray;
};

export const snapshotToArrayWithId = (snapshot) => snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
