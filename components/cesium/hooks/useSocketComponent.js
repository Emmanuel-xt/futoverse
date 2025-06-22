import {
  AddUserMarkerToMap,
  DisplayAllUserMarkers,
} from "@components/socket/AddUserMarkerToMap";
import {
  AddOnlineMarkers,
  ModelRelocation,
  NewShopCreation,
} from "@components/socket/ModelAddition";

export const useSocketComponents = () => {
  AddUserMarkerToMap();
  DisplayAllUserMarkers();
  ModelRelocation();
  NewShopCreation();
  AddOnlineMarkers();
};
